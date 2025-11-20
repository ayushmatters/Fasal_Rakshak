/**
 * Email logger middleware
 * Logs email send attempts and outcomes for debugging and audit trail
 */

const emailLogs = [] // In-memory store; use MongoDB in production

const logEmailSend = (data) => {
  const entry = {
    timestamp: new Date(),
    requestId: data.requestId,
    to: data.to,
    subject: data.subject,
    messageId: data.messageId,
    previewUrl: data.previewUrl,
    success: data.success,
    error: data.error,
    retries: data.retries || 0
  }

  emailLogs.push(entry)

  // Keep only last 100 logs in memory
  if (emailLogs.length > 100) {
    emailLogs.shift()
  }

  return entry
}

const getEmailLogs = (limit = 20) => {
  return emailLogs.slice(-limit).reverse()
}

const getEmailLogById = (requestId) => {
  return emailLogs.find((log) => log.requestId === requestId)
}

module.exports = {
  logEmailSend,
  getEmailLogs,
  getEmailLogById
}
