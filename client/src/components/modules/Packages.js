import { useState, useCallback, useEffect } from 'react';
import { CenteredMessageDialog } from "../CenteredMessageDialog";

const Packages = () => {
    const [packageData, setPackageData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState({});
    const [isChange, setIsChange] = useState(false);

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
    const onChangeRow = (pkgId, field, value, type) => {

        setIsChange(prev => ({ ...prev, [pkgId]: true }));

        setPackageData(prev =>
            prev.map(r => r.PACKAGE === pkgId ? {
                ...r,
                [field]: type === "number"
                    ? (value === "" ? "" : Number(value))
                    : value
            } : r
            )
        );
    };
    /********************************************************************************************************************/
    const saveRow = async (row) => {

        const pkgId = Number(row.PACKAGE);

        setSaving(s => ({ ...s, [pkgId]: true }));

        setLoading(true);

        try {
            const res = await fetch(`/cloudServer/updatePackages/${encodeURIComponent(pkgId)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    DES: row.DES,
                    EDES: row.EDES,
                    PRICE: row.PRICE,
                    TRANSACTION: row.TRANSACTION
                })
            });

            const data = await res.json();
            if (res.ok) {
                setTitleMessage("החבילה עודכנה בהצלחה");
                setBodyMessage("ניתן להמשיך");
                setColorMessage("success");
                setDisplayMessage(true);
                setTimeout(() => cleanMessage(), 2500);
                return;
            } else {
                setTitleMessage("משהו השתבש");
                setBodyMessage("יש לנסות שוב");
                setColorMessage("danger");
                setDisplayMessage(true);
                setTimeout(() => cleanMessage(), 2500);
            }

            if (data?.row) {
                setPackageData(prev =>
                    prev.map(r => (r.PACKAGE === pkgId ? { ...r, ...data.row } : r))
                );
            }
        } catch (err) {
            console.error(err);
            alert(err.message);
        } finally {
            setSaving(s => ({ ...s, [pkgId]: false }));
            setLoading(false);
        }
    };
    /********************************************************************************************************************/
    const getPackages = useCallback(async () => {

        setLoading(true);

        try {
            const res = await fetch(`/cloudServer/packages`);
            if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

            const data = await res.json();
            setPackageData(data);

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
    useEffect(() => {
        getPackages();
    }, [getPackages]);
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

                <h4 className='mb-3 fw-bold' style={{ color: "#00adee" }} >חבילות</h4>

                <div className="card">
                    <div className="card-body p-3">
                        <h5 style={{ color: "#00adee" }}>עדכון חבילות</h5>

                        <div className="table-responsive">
                            <table className="table table-light table-striped align-middle">
                                <thead>
                                    <tr>
                                        <th style={{ width: 40 }}>חבילה</th>
                                        <th style={{ width: 140 }}>תיאור</th>
                                        <th style={{ width: 140 }}>תיאור לועזי</th>
                                        <th style={{ width: 140 }}>מחיר ב-₪</th>
                                        <th style={{ width: 140 }}>פעולות</th>
                                        <th style={{ width: 50 }}>עדכון</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {packageData?.map((row) => (
                                        <tr key={row.PACKAGE}>
                                            <td className="fw-bold">{row.PACKAGE}</td>

                                            <td>
                                                <input
                                                    className="form-control form-control-sm"
                                                    value={row.DES ?? ""}
                                                    onChange={(e) => onChangeRow(row.PACKAGE, "DES", e.target.value, row.type = "text")}
                                                />
                                            </td>

                                            <td>
                                                <input
                                                    className="form-control form-control-sm"
                                                    value={row.EDES ?? ""}
                                                    onChange={(e) => onChangeRow(row.PACKAGE, "EDES", e.target.value, row.type = "text")}
                                                />
                                            </td>

                                            <td>
                                                <input
                                                    className="form-control form-control-sm"
                                                    type="number"
                                                    step="0.01"
                                                    value={row.PRICE ?? ""}
                                                    onChange={(e) => onChangeRow(row.PACKAGE, "PRICE", e.target.value, row.type = "number")}
                                                />
                                            </td>

                                            <td>
                                                <input
                                                    className="form-control form-control-sm"
                                                    type="number"
                                                    value={row.TRANSACTION ?? ""}
                                                    onChange={(e) => onChangeRow(row.PACKAGE, "TRANSACTION", e.target.value, row.type = "number")}
                                                />
                                            </td>

                                            <td>
                                                <button
                                                    className="btn btn-secondary w-75 btn-sm"
                                                    style={{ backgroundColor: "#00adee", color: "white" }}
                                                    onClick={() => saveRow(row)}
                                                    disabled={!!saving[row.PACKAGE] || !isChange[row.PACKAGE]}
                                                >
                                                    {saving[row.PACKAGE] ? "שומר" : "עדכן"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {!packageData?.length && !loading && (
                                        <tr>
                                            <td colSpan={5} className="text-center text-secondary">
                                                לא נמצאו חבילות להצגה
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Packages;