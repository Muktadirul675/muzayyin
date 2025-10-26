import { defineStore } from 'pinia'
import api from '@/services/api'
import { ref, computed } from 'vue'
import isEqual from 'lodash/isEqual'
import cloneDeep from 'lodash/cloneDeep'
import omit from 'lodash/omit'
import { transformSection } from '@/services/utils'
import { handleError } from '@/services/errors'

let uid = 0

export const useBuilderStore = defineStore('builderStore', () => {
    const feed = ref([])
    const originalFeed = ref([])
    const popup = ref(null)
    const isLoading = ref(false)
    const error = ref('')
    const buildLoading = ref(false)
    const buildSuccess = ref(false)
    const buildError = ref('')

    const IGNORED_KEYS = ['highlightC', 'highlightP', 'show', 'uid']

    const init = async () => {
        try {
            isLoading.value = true
            const res = await api.get('/feed')
            const formatted = res.data.map((s) => ({
                ...s,
                notices: s.notices.map((n) => ({ ...n, uid: uid++ })),
                categories: s.categories.map((s) => ({ ...s, uid: uid++ })),
                images: s.images.map((i) => ({ ...i, uid: uid++ })),
                products: s.products.map((i) => ({ ...i, uid: uid++ })),
                slides: (s.slides || []).map((sl) => ({ ...sl, uid: uid++ })),
                show: false,
                highlightP: false,
                highlightC: false,
                uid: uid++,
                args: s.args ? { ...s.args } : {},
            }))
            feed.value = formatted
            originalFeed.value = cloneDeep(formatted)
        } catch (e) {
            error.value = e
        } finally {
            isLoading.value = false
        }
    }

    const stripIgnoredKeys = (obj) => {
        if (Array.isArray(obj)) {
            return obj.map(stripIgnoredKeys)
        } else if (obj && typeof obj === 'object') {
            const cleaned = {}
            for (const key in obj) {
                if (!IGNORED_KEYS.includes(key)) {
                    cleaned[key] = stripIgnoredKeys(obj[key])
                }
            }
            return cleaned
        }
        return obj
    }

    const isChanged = computed(() => {
        const cleanedFeed = stripIgnoredKeys(feed.value)
        const cleanedOriginal = stripIgnoredKeys(originalFeed.value)
        return !isEqual(cleanedFeed, cleanedOriginal)
    })

    const reset = () => {
        feed.value = cloneDeep(originalFeed.value)
    }

    const update = (uid, value) => {
        const index = feed.value.findIndex((s) => s.uid === uid)
        if (index !== -1) {
            feed.value[index] = value
        }
    }

    const getIndex = (uid) => feed.value.findIndex((s) => s.uid === uid)
    const get = (uid) => feed.value.find((s) => s.uid === uid)
    const remove = (uid) => {
        feed.value = feed.value.filter((s) => s.uid !== uid)
    }

    const swap = (uid, step) => {
        const index = getIndex(uid)
        if (index !== -1) {
            if (index === 0 && step === -1) return
            if (index === feed.value.length - 1 && step === 1) return
                ;[feed.value[index], feed.value[index + step]] = [
                    feed.value[index + step],
                    feed.value[index],
                ]
        }
    }

    const pop = (val) => {
        popup.value = val
    }

    const addSectionAfter = (uuid, sectionObj) => {
        const newSection = {
            ...sectionObj,
            uid: uid++,
            notices: (sectionObj.notices || []).map((n) => ({ ...n, uid: uid++ })),
            categories: (sectionObj.categories || []).map((c) => ({ ...c, uid: uid++ })),
            images: (sectionObj.images || []).map((i) => ({ ...i, uid: uid++ })),
            products: (sectionObj.products || []).map((p) => ({ ...p, uid: uid++ })),
            slides: (sectionObj.slides || []).map((s) => ({ ...s, uid: uid++ })),
            show: false,
            highlightP: false,
            highlightC: false,
            args: sectionObj.args ? { ...sectionObj.args } : {},
        }

        if (String(uuid) === '-1') {
            feed.value.unshift(newSection)
            pop(null)
            return
        }

        const index = getIndex(uuid)
        if (index !== -1) {
            feed.value.splice(index + 1, 0, newSection)
        }
        pop(null)
    }

    // ð§ Build Method
    const build = async () => {
        buildLoading.value = true
        buildError.value = ''
        buildSuccess.value = false

        try {
            const transformed = await Promise.all(
                feed.value.map(async (section) => {
                    const transformedSection = transformSection(section)

                    // Navbar: upload logo
                    if (
                        transformedSection.type === 'navbar' &&
                        transformedSection.args?.logo instanceof File
                    ) {
                        const formData = new FormData()
                        formData.append('image', transformedSection.args.logo)

                        const response = await api.post('/images/upload/', formData, {
                            headers: { 'Content-Type': 'multipart/form-data' },
                        })

                        transformedSection.args.logo = response.data.image
                        delete transformedSection.args.preview
                    }

                    // Image Slider: upload image_ids[*].file
                    if (
                        transformedSection.type === 'image_slider' &&
                        Array.isArray(transformedSection.image_ids)
                    ) {
                        const uploadedImageIds = []

                        for (const img of transformedSection.image_ids) {
                            if (img.id) {
                                uploadedImageIds.push(img.id)
                            } else if (img?.file instanceof File) {
                                const formData = new FormData()
                                formData.append('image', img.file)

                                const response = await api.post('/images/upload/', formData, {
                                    headers: { 'Content-Type': 'multipart/form-data' },
                                })

                                uploadedImageIds.push(response.data.id)
                            }
                        }

                        transformedSection.image_ids = uploadedImageIds
                    }

                    // Categories Slider: upload slides[*].image
                    if (
                        transformedSection.type === 'categories_slider' &&
                        Array.isArray(transformedSection.slides)
                    ) {
                        for (const slide of transformedSection.slides) {
                            if (slide?.image instanceof File) {
                                const formData = new FormData()
                                formData.append('image', slide.image)

                                const response = await api.post('/images/upload/', formData, {
                                    headers: { 'Content-Type': 'multipart/form-data' },
                                })

                                slide.image = response.data.image
                                delete slide.preview
                            }
                        }
                    }

                    // Footer: upload args.file â set args.logo
                    if (
                        transformedSection.type === 'footer' &&
                        transformedSection.args?.file instanceof File
                    ) {
                        const formData = new FormData()
                        formData.append('image', transformedSection.args.file)

                        const response = await api.post('/images/upload/', formData, {
                            headers: { 'Content-Type': 'multipart/form-data' },
                        })

                        transformedSection.args.logo = response.data.image
                        delete transformedSection.args.file 
                        delete transformedSection.args.preview 
                    }

                    // Notice: upload notices[*].text â notice_ids
                    if (
                        transformedSection.type === 'notice' &&
                        Array.isArray(transformedSection.notice_ids)
                    ) {
                        const noticeIds = []

                        for (const notice of transformedSection.notice_ids) {
                            if (typeof notice.text === 'string' && notice.text.trim() !== '') {
                                const response = await api.post('notice/', {
                                    text: notice.text,
                                    is_active: true,
                                })

                                noticeIds.push(response.data.id)
                            }
                        }

                        transformedSection.notice_ids = noticeIds
                    }

                    return transformedSection
                })
            )

            console.log(transformed)

            await api.post('/feed/build/', transformed)
            buildSuccess.value = true
        } catch (err) {
            handleError(err)
            buildError.value = err?.message || err?.response?.data?.message || 'Build failed. Please try again.'
        } finally {
            buildLoading.value = false
        }
    }

    return {
        feed,
        originalFeed,
        popup,
        pop,
        error,
        isLoading,
        init,
        get,
        update,
        remove,
        swap,
        addSectionAfter,
        isChanged,
        reset,
        build,
        buildLoading,
        buildSuccess,
        buildError,
    }
})