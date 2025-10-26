import {toast} from './toast'
import { convert_to_normal_word } from './utils'

function handleErrors(errors) {
  // Example DRF response: { "email": ["This field is required."], "non_field_errors": ["Invalid data."] }

  for (const [field, messages] of Object.entries(errors)) {
    if (Array.isArray(messages)) {
      messages.forEach(msg => {
        toast.error(`${convert_to_normal_word(field)}: ${msg}`) // You can replace this with toast, modal, etc.
      })
    } else {
      toast.error(`${field}: ${messages}`)
    }
  }
}

export function handleError(err){
  if(err.response && err.response.data){
    handleErrors(err.response.data)
    return true
  }
  return false
}