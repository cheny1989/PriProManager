import { useState, useCallback } from 'react';
import { CenteredMessageDialog } from "../CenteredMessageDialog";

const AllCustomers = ({ onImportCustomer, onClearParent }) => {
    const [allCustomers, setAllCustomers] = useState(null);
    const [loading, setLoading] = useState(false);
    const [customerFilter, setCustomerFilter] = useState("");

    // Messages
    const [displayMessage, setDisplayMessage] = useState(false);
    const [bodyMessage, setBodyMessage] = useState("");
    const [titleMessage, setTitleMessage] = useState("");
    const [colorMessage, setColorMessage] = useState("");
    const handleCloseDisplayMessage = () => setDisplayMessage(false);
    /********************************************************************************************************************/
    const cleanMessage = () => {
        setTitleMessage("");
        setBodyMessage("");
        setColorMessage("");
        setDisplayMessage("");
    }
    /********************************************************************************************************************/
    const getAllCustomers = useCallback(async () => {

        setLoading(true);

        try {
            const res = await fetch(`/cloudServer/getCustomers`);
            if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

            const data = await res.json();
            if (data.length === 0) {
                setTitleMessage("לא נמצא לקוח עם המזהה שסופק");
                setBodyMessage("אנא בדוק את המזהה ונסה שוב");
                setColorMessage("danger");
                setDisplayMessage(true);
                setTimeout(() => cleanMessage(), 2500);
                return;
            } else {
                setAllCustomers(data)
            }
        } catch (err) {
            setTitleMessage("משהו השתבש");
            setBodyMessage("יש לנסות שוב");
            setColorMessage("danger");
            setDisplayMessage(true);
            setTimeout(() => cleanMessage(), 2500);
            return;
        } finally {
            setLoading(false);
        }
    }, []);
    /********************************************************************************************************************/
    const clearForm = () => {
        setAllCustomers(null);
        setCustomerFilter("");
        onClearParent?.();
    }
    /********************************************************************************************************************/
    const filteredCustomers = (allCustomers ?? []).filter((c) => {
        const q = customerFilter.trim().toLowerCase();
        if (!q) return true;

        return (
            String(c.CUSTDES ?? "").toLowerCase().includes(q) ||
            String(c.CUST ?? "").toLowerCase().includes(q) ||
            String(c.GUID ?? "").toLowerCase().includes(q)
        );
    });
    /********************************************************************************************************************/
    return (
        <div className="p-3 card mb-4">
            <div className='card-body'>

                {/* Loading */}
                {loading && (
                    <div className="loading-overlay">
                        <div className="spinner-border text-light" role="status">
                            <label className="visually-hidden">Loading...</label>
                        </div>
                    </div>
                )}

                {/* Message - Start */}
                <CenteredMessageDialog
                    show={displayMessage}
                    title={titleMessage}
                    bodyMessage={bodyMessage}
                    colorMessage={colorMessage}
                    onClose={handleCloseDisplayMessage}
                />

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

                    <div className="ms-auto d-flex align-items-center gap-2">
                        <div className="input-group" style={{ width: 400 }}>
                            <input
                                className="form-control"
                                placeholder="חיפוש לקוח..."
                                value={customerFilter}
                                onChange={(e) => setCustomerFilter(e.target.value)}
                            />
                            <span className="input-group-text rounded">
                                <i className="bi bi-search"></i>
                            </span>
                            {customerFilter && (
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary rounded"
                                    onClick={() => setCustomerFilter("")}
                                >
                                    <i className='bi bi-x-circle'></i>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="text-muted small">
                        מוצגים: <b>{filteredCustomers.length}</b> / {allCustomers?.length ?? 0}
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
                                <th>חבילה</th>
                                <th style={{ width: 120 }} className="text-end">פעולה</th>
                            </tr>
                        </thead>

                        <tbody>
                            {(filteredCustomers ?? []).map((cst, index) => (
                                <tr key={cst.CUST}>
                                    <td className="text-muted">{index + 1}</td>
                                    <td className="fw-semibold">{cst.CUSTDES}</td>
                                    <td className="fw-semibold">{cst.EMAIL}</td>
                                    <td className="fw-semibold">{cst.PHONE}</td>
                                    <td className="fw-semibold">{cst.WTAXNUM}</td>
                                    <td className="fw-semibold">{cst.DES} [{Number(cst.PRICE).toLocaleString()} ₪]</td>
                                    <td className="text-end">
                                        <button
                                            type="button"
                                            onClick={() => onImportCustomer(cst.GUID)}
                                            className="btn btn-sm btn-outline-primary importCust"
                                            style={{ borderColor: "#00adee", color: "#00adee" }}
                                        >
                                            <i className="bi bi-box-arrow-in-down-left ms-1"></i>
                                            ייבא
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {!allCustomers?.length && (
                                <tr>
                                    <td colSpan={6} className="text-center text-muted py-4">
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