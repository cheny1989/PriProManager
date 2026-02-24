import { useState, useCallback } from 'react';
import moment from 'moment';
import AllCustomers from './AllCustomers';
import { CenteredMessageDialog } from "../CenteredMessageDialog";

const Billing = () => {
    const [loading, setLoading] = useState(false);
    const [guid, setGuid] = useState('');
    const [invoices, setInvoices] = useState(null);

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
    const handleImportCustomer = (guidValue) => {
        setGuid(guidValue);
    };
    /********************************************************************************************************************/
    const getInvoices = useCallback(async (custId) => {
        if (!custId) {
            setTitleMessage("יש לספק מזהה לקוח תקין לפני שליפת חשבוניות");
            setBodyMessage("יש לנסות שוב");
            setColorMessage("danger");
            setDisplayMessage(true);
            setTimeout(() => cleanMessage(), 2500);
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`/cloudServer/getInvoices/${custId}`);
            if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

            const data = await res.json();
            setInvoices(data);
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
    const getCustomer = useCallback(async () => {

        setLoading(true);

        try {
            const res = await fetch(`/cloudServer/getCustomer/${guid}`);
            if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

            const data = await res.json();
            if (data.length === 0) {
                setTitleMessage("לא נמצא לקוח עם המזהה שסופק");
                setBodyMessage("יש לנסות שוב");
                setColorMessage("danger");
                setDisplayMessage(true);
                setTimeout(() => cleanMessage(), 2500);
                return;
            } else {
                const custValue = data[0]?.CUST ?? null;
                getInvoices(custValue);
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
    }, [guid, getInvoices]);
    /********************************************************************************************************************/
    // useEffect(() => {
    //     if (guid) {
    //         getCustomer();
    //     }
    // }, [guid, getCustomer]);
    /********************************************************************************************************************/
    const clearForm = () => {
        setGuid('');
        setInvoices(null);
    }
    /********************************************************************************************************************/
    const ils = (n) => new Intl.NumberFormat("he-IL").format(Number(n ?? 0));
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

                {/* Message - Start */}
                <CenteredMessageDialog
                    show={displayMessage}
                    title={titleMessage}
                    bodyMessage={bodyMessage}
                    colorMessage={colorMessage}
                    onClose={handleCloseDisplayMessage}
                />

                <h4 className='mb-3 fw-bold' style={{ color: "#00adee" }} >חשבוניות</h4>

                <AllCustomers
                    onImportCustomer={handleImportCustomer}
                    onClearParent={clearForm}
                />

                <div className="card">
                    <div className="card-body p-3">
                        <h5 style={{ color: "#00adee" }}>חשבוניות ללקוח</h5>

                        <div
                            className="row g-3 pb-4 align-items-end border rounded p-2 me-1 ms-1 mt-3"
                            style={{
                                borderBottom: "1px solid #d9dde2ff",
                                paddingBottom: "1rem",
                                backgroundColor: "#f8f9fa"
                            }}
                        >
                            <div className="col-md-5">
                                <label className="form-label">מזהה לקוח</label>
                                <input
                                    className="form-control w-100"
                                    value={guid}
                                    onChange={(e) => setGuid(e.target.value)}
                                    dir="ltr"
                                />
                            </div>

                            <div className="col-md-3">
                                <div className="col-12">
                                    <button
                                        type="button"
                                        onClick={getCustomer}
                                        className="btn"
                                        disabled={!guid}
                                        style={{ backgroundColor: "#00adee", color: "white" }}>
                                        חיפוש
                                    </button>

                                    <button type="button" className="btn ms-2 btn-secondary me-2" onClick={clearForm}>
                                        נקה טופס
                                    </button>
                                </div>
                            </div>
                        </div>

                        {invoices?.[0] && (
                            <div className="row g-3 pb-4 align-items-end border rounded p-2 me-1 ms-1 mt-3" dir='ltr'>
                                <div className="fw-bold fs-4 mb-1">{invoices[0].CUSTDES}</div>
                                <div className="d-flex flex-wrap gap-3 mt-1 text-muted">
                                    <div>
                                        <span className="fw-bold"><i className="bi bi-envelope me-2"></i></span> {invoices[0].EMAIL}
                                    </div>
                                    <div>
                                        <span className="fw-bold"><i className="bi bi-telephone me-2"></i></span> {invoices[0].PHONE}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="table-responsive d-none d-md-block mt-4">
                            <table className="table table-hover align-middle text-center">
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>חשבוניות</th>
                                        <th>תאריך חשבונית</th>
                                        <th>מחיר לפני מע"מ</th>
                                        <th>מע"מ</th>
                                        <th>סה"כ מחיר</th>
                                        <th>אסמכתה</th>
                                        <th>סוג חשבונית</th>
                                        <th>הורדה</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices?.[0].IV === null ?
                                        <tr>
                                            <td colSpan={9} className="text-center text-center py-4 fw-bold" style={{ color: "rgb(92, 108, 117)" }}>
                                                לא נמצאו חשבוניות להצגה ללקוח זה
                                            </td>
                                        </tr>
                                        : <>
                                            {(invoices ?? []).map((iv, index) => (
                                                <tr key={iv.IV ?? iv.IVNUM}>
                                                    <td>{index + 1}</td>
                                                    <td>{iv.IVNUM}</td>
                                                    <td>{moment(iv.IVDATE_FORMATTED).utc().format('DD/MM/YYYY')}</td>
                                                    <td>₪{ils(iv.DISPRICE)}</td>
                                                    <td>₪{ils(iv.VAT)}</td>
                                                    <td>₪{ils(iv.TOTPRICE)}</td>
                                                    <td>{iv.IVREF}</td>
                                                    <td>
                                                        {Number(iv.DEBIT) === 1 ? <span className="badge text-bg-success">חיוב</span> : <span className="badge text-bg-warning">זיכוי</span>}
                                                    </td>
                                                    <td><i className="bi bi-file-earmark-pdf" style={{ color: "#00adee", fontSize: "23px" }}></i></td>
                                                </tr>
                                            ))}
                                        </>}

                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
export default Billing;