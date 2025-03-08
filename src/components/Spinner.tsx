export default function Spinner({size="md"}:{size?:string}){
    if(size == "md"){
        return <div className="border-gray-300 h-8 w-8 transition-all animate-spin rounded-full border-2 border-t-blue-600" />
    }
    if(size == 'sm'){
        return <div className="border-gray-300 h-4 w-4 transition-all animate-spin rounded-full border-2 border-t-blue-600" />
    }
}