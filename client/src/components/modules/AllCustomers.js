import { useState, useCallback } from 'react';
import { Modal, Button } from 'react-bootstrap';

const AllCustomers = ({ onImportCustomer }) => {
    const [allCustomers, setAllCustomers] = useState(null);
    const [displayAlertMessage, setDisplayAlertMessage] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertMessageBody, setAlertMessageBody] = useState('');
    const [loading, setLoading] = useState(false);
    const handleClose = () => setDisplayAlertMessage(false);
    /********************************************************************************************************************/
    const getAllCustomers = useCallback(async () => {

        setLoading(true);

        try {
            const res = await fetch(`/cloudServer/getCustomers`);
            if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

            const data = await res.json();
            if (data.length === 0) {
                setAlertMessage("❌ לא נמצא לקוח עם המזהה שסופק");
                setAlertMessageBody("אנא בדוק את המזהה ונסה שוב");
                setDisplayAlertMessage(true);
                return;
            } else {
                setAllCustomers(data)
            }
        } catch (err) {
            console.warn("❌ Something went wrong:", err);
        } finally {
            setLoading(false);
        }
    }, []);
    /********************************************************************************************************************/
    const clearForm = () => {
        setAllCustomers(null);
    }
    /********************************************************************************************************************/
    return (
        <div className="p-3 m-3 card mb-4">
            <div className='card-body'>

                {/* Loading */}
                {loading && (
                    <div className="loading-overlay">
                        <div className="spinner-border text-light" role="status">
                            <label className="visually-hidden">Loading...</label>
                        </div>
                    </div>
                )}

                <Modal show={displayAlertMessage} onHide={handleClose} centered dir="rtl">
                    <Modal.Header>
                        <Modal.Title><div className='fw-bold'>{alertMessage}</div></Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{alertMessageBody}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            סגירה
                        </Button>
                    </Modal.Footer>
                </Modal>

                <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
                    <button
                        type="button"
                        onClick={getAllCustomers}
                        className="btn btn-primary d-flex align-items-center gap-2"
                        style={{ backgroundColor: "#00adee", borderColor: "#00adee" }}
                    >
                        <i className="bi bi-download"></i>
                        שלוף את כל הלקוחות
                    </button>

                    <button
                        type="button"
                        className="btn btn-outline-secondary d-flex align-items-center gap-2"
                        onClick={clearForm}
                    >
                        <i className="bi bi-eraser"></i>
                        נקה טופס
                    </button>

                    <div className="ms-auto text-muted small">
                        נמצאו: <b>{allCustomers?.length ?? 0}</b> לקוחות
                    </div>
                </div>


                <div className="table-responsive">
                    <table className="table table-sm table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: 60 }}>#</th>
                                <th>שם לקוח</th>
                                <th>אימייל</th>
                                <th>טלפון</th>
                                <th>מספר חברה</th>
                                <th style={{ width: 120 }} className="text-end">פעולה</th>
                            </tr>
                        </thead>

                        <tbody>
                            {(allCustomers ?? []).map((cst, index) => (
                                <tr key={cst.CUST}>
                                    <td className="text-muted">{index + 1}</td>
                                    <td className="fw-semibold">{cst.CUSTDES}</td>
                                    <td className="fw-semibold">{cst.EMAIL}</td>
                                    <td className="fw-semibold">{cst.PHONE}</td>
                                    <td className="fw-semibold">{cst.WTAXNUM}</td>
                                    <td className="text-end">
                                        <button
                                            type="button"
                                            onClick={() => onImportCustomer(cst.GUID)}
                                            className="btn btn-sm btn-outline-primary importCust"
                                            style={{ borderColor: "#00adee", color: "#00adee" }}
                                        >
                                            <i className="bi bi-box-arrow-in-down-left me-1"></i>
                                            ייבא
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {!allCustomers?.length && (
                                <tr>
                                    <td colSpan={3} className="text-center text-muted py-4">
                                        אין נתונים להצגה
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};
export default AllCustomers;