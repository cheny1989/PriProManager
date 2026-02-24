export function CenteredMessageDialog({
  show,
  title,
  bodyMessage,
  colorMessage,
  dir,
  onClose
}) {
  /********************************************************************************************************************/
  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show" onClick={onClose} />

      {/* Centered window */}
      <div
        dir="rtl"
        className="position-fixed top-50 start-50 translate-middle"
        style={{ zIndex: 1055, width: "min(520px, 92vw)" }}
        role="dialog"
        aria-modal="true"
      >
        <div className={`card border-${colorMessage} shadow`}>
          <div className={`card-header bg-${colorMessage} text-white d-flex justify-content-between align-items-center`}>
            <div className="fw-bold">{title}</div>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={onClose}
            />
          </div>

          <div className={`card-body bg-${colorMessage} bg-opacity-10`}>
            <div className={`text-${colorMessage} fw-semibold`}>{bodyMessage}</div>
          </div>

          <div className={`card-footer bg-${colorMessage} bg-opacity-10 d-flex justify-content-end gap-2`}>
            <button className={`btn btn-${colorMessage}`} onClick={onClose}>
              סגור
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
