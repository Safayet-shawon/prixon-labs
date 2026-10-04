export const email = 'hello@praxivon.com'
const whatsappCandidate = (import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/[\s()+.-]/g, '')
export const whatsappNumber = /^[1-9]\d{6,14}$/.test(whatsappCandidate) ? whatsappCandidate : ''
