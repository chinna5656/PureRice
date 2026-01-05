export function mobileValidator(mobile) {
    if (!mobile) return "Please fill in this field."
    if (mobile.length != 10) return 'โปรดกรอกหมายเลขโทรศัพท์ให้ถูกต้อง'
    return ''
  }
  