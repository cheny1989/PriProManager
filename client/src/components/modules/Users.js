import { useState, useCallback, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

const Users = () => {
    const [loading, setLoading] = useState(false);
    const [displayAlertMessage, setDisplayAlertMessage] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertMessageBody, setAlertMessageBody] = useState('');
    const handleClose = () => setDisplayAlertMessage(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [cust, setCust] = useState(0);
    const [custDes, setCustDes] = useState("");

    const [resetUsername, setResetUsername] = useState('');
    const [resetPassword, setResetPassword] = useState('');
    const [confirmPassword, setconfirmPassword] = useState('');
    const [resetCust, setResetCust] = useState(0);
    const [restCustDes, setResrtCustDes] = useState("");

    const [customers, setCustomers] = useState([]);
    /********************************************************************************************************************/
    const getCustomers = useCallback(async () => {
        try {
            const res = await fetch(`/cloudServer/getCustomers`);
            if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

            const data = await res.json();
            setCustomers(data);

        } catch (err) {
            console.warn("❌ Something went wrong:", err);
        }
    }, []);
    /********************************************************************************************************************/
    useEffect(() => {
        getCustomers();
    }, [getCustomers]);
    /********************************************************************************************************************/
    async function createUser() {

        setLoading(true);

        if (!username || !password || !cust) {
            setAlertMessage(" יש שדות חובה חסרים⚠️");
            setAlertMessageBody("אנא מלא את כל השדות המסומנים בכוכבית אדומה");
            setDisplayAlertMessage(true);
            setLoading(false);
            return;
        }

        var lowerCaseLetters = /[a-z]/g;
        var upperCaseLetters = /[A-Z]/g;
        var number = /[0-9]/g;
        var specialChar = /[!@#$%^&*(),.?":{}|<>_]/g;
        var minLength = 8;

        const hasLowercase = lowerCaseLetters.test(password);
        const hasUppercase = upperCaseLetters.test(password);
        const hasNumbers = number.test(password);
        const hasSpecialChar = specialChar.test(password);
        const hasMinLength = password.length >= minLength;

        if (!hasLowercase || !hasUppercase || !hasNumbers || !hasSpecialChar || !hasMinLength) {
            setAlertMessage("❌ הסיסמה החדשה לא עומדת בדרישות האבטחה");
            setAlertMessageBody("אנא ודא שהסיסמה החדשה כוללת לפחות 8 תווים, אותיות קטנות, אותיות גדולות, מספרים ותווים מיוחדים.");
            setDisplayAlertMessage(true);
            setLoading(false);
            return;
        }


        try {

            //----- Step 1: Chack if user exists for cust
            const checkRes = await fetch("/cloudServer/CustomerUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, cust: Number(cust) })
            });

            const checkData = await checkRes.json();
            if (!checkRes.ok) throw new Error(checkData?.message || "Check failed");

            if (checkData.user_exists === true) {
                setAlertMessage("⚠️ המשתמש כבר קיים ללקוח הזה");
                setAlertMessageBody(`שם המשתמש "${username}" כבר קיים עבור הלקוח שנבחר "${checkData.cust_des}". אנא בחר שם משתמש אחר.`);
                setDisplayAlertMessage(true);
                return;
            }

            //----- Step 2: Create new user for cust
            const dataArray = { username, password, cust: Number(cust) };

            const res = await fetch("/cloudServer/createNewUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dataArray })
            });

            const data = await res.json();

            if (res.ok) {
                clearForm();
                setAlertMessage("✅ המשתמש נוצר בהצלחה");
                setAlertMessageBody(`המשתמש "${username}" נוצר בהצלחה עבור הלקוח "${custDes}" שנבחר.`);
                setDisplayAlertMessage(true);
            } else {
                setAlertMessage("❌ יצירת משתמש נכשלה");
                setAlertMessageBody(data?.message || "Server error");
                setDisplayAlertMessage(true);
            }
        } catch (err) {
            console.warn("❌ Something went wrong:", err);
            setAlertMessage("❌ תקלה בביצוע הפעולה");
            setAlertMessageBody(err.message || "Unknown error");
            setDisplayAlertMessage(true);
        } finally {
            setLoading(false);
        }
    }
    /********************************************************************************************************************/
    async function updatePassword() {

        setLoading(true);

        if (!resetUsername || !resetPassword || !resetCust) {
            setAlertMessage(" יש שדות חובה חסרים⚠️");
            setAlertMessageBody("אנא מלא את כל השדות המסומנים בכוכבית אדומה");
            setDisplayAlertMessage(true);
            setLoading(false);
            return;
        }

        if (resetPassword !== confirmPassword) {
            setAlertMessage("❌ הסיסמאות לא תואמות");
            setAlertMessageBody("אנא ודא שהסיסמה ואימות הסיסמה זהים.");
            setDisplayAlertMessage(true);
            setLoading(false);
            return;
        }

        var lowerCaseLetters = /[a-z]/g;
        var upperCaseLetters = /[A-Z]/g;
        var number = /[0-9]/g;
        var specialChar = /[!@#$%^&*(),.?":{}|<>_]/g;
        var minLength = 8;

        const hasLowercase = lowerCaseLetters.test(resetPassword);
        const hasUppercase = upperCaseLetters.test(resetPassword);
        const hasNumbers = number.test(resetPassword);
        const hasSpecialChar = specialChar.test(resetPassword);
        const hasMinLength = resetPassword.length >= minLength;

        console.log(hasSpecialChar)


        if (!hasLowercase || !hasUppercase || !hasNumbers || !hasSpecialChar || !hasMinLength) {
            setAlertMessage("❌ הסיסמה החדשה לא עומדת בדרישות האבטחה");
            setAlertMessageBody("אנא ודא שהסיסמה החדשה כוללת לפחות 8 תווים, אותיות קטנות, אותיות גדולות, מספרים ותווים מיוחדים.");
            setDisplayAlertMessage(true);
            setLoading(false);
            return;
        }

        try {

            //----- Step 1: Chack if user exists for cust
            const checkRes = await fetch("/cloudServer/CustomerUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: resetUsername, cust: Number(resetCust) })
            });

            const checkData = await checkRes.json();
            if (!checkRes.ok) throw new Error(checkData?.message || "Check failed");

            if (checkData.user_exists === false) {
                setAlertMessage("⚠️ המשתמש לא קיים ללקוח זה");
                setAlertMessageBody(`שם המשתמש "${resetUsername}" לא קיים עבור הלקוח שנבחר "${restCustDes}". אנא ודא את שם המשתמש והלקוח.`);
                setDisplayAlertMessage(true);
                return;
            }

            //----- Step 2: Create new user for cust
            const dataArray = { username: resetUsername, password: resetPassword, cust: Number(resetCust) };

            const res = await fetch("/cloudServer/updatePassword", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dataArray })
            });

            const data = await res.json();

            if (res.ok) {
                clearForm();
                setAlertMessage("✅ הסיסמה עודכנה בהצלחה");
                setAlertMessageBody(`הסיסמה עבור המשתמש "${resetUsername}" עודכנה בהצלחה.`);
                setDisplayAlertMessage(true);
            } else {
                setAlertMessage("❌עדכון הסיסמה נכשלה");
                setAlertMessageBody(data?.message || "Server error");
                setDisplayAlertMessage(true);
            }
        } catch (err) {
            console.warn("❌ Something went wrong:", err);
            setAlertMessage("❌ תקלה בביצוע הפעולה");
            setAlertMessageBody(err.message || "Unknown error");
            setDisplayAlertMessage(true);
        } finally {
            setLoading(false);
        }
    }
    /********************************************************************************************************************/
    const clearForm = () => {
        setUsername('');
        setPassword('');
        setCust(0);
        setCustDes("");
        setResetUsername('');
        setResetPassword('');
        setconfirmPassword('');
        setResetCust(0);
        setResrtCustDes("");
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

                <h4 className='fw-bold' style={{ color: "#00adee" }} >משתמשים</h4>
                <div style={{ fontSize: "0.85rem" }} className='text-secondary mt-0 mb-3'>אנא ודא שהסיסמה החדשה כוללת לפחות 8 תווים, אותיות קטנות, אותיות גדולות, מספרים ותווים מיוחדים</div>

                <div className="card">
                    <div className="card-body p-3">
                        <h5 style={{ color: "#00adee" }}>יצירת משתמש</h5>

                        <div className="row g-3 text-white mt-3">
                            <div className="col-md-3">
                                <label className="form-label">שם משתמש<span className='text-danger'>*</span></label>
                                <input className="form-control" value={username} onChange={e => setUsername(e.target.value)} dir='ltr' />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">סיסמה<span className='text-danger'>*</span></label>
                                <input className="form-control" type='password' dir='ltr' value={password} onChange={e => setPassword(e.target.value)} />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">בחירת לקוח<span className='text-danger'>*</span></label>
                                {/* <select className="form-select" value={cust} onChange={e => setCust(e.target.value)}  >
                                    <option value="">בחירת לקוח</option>
                                    {customers.map((cst) => (
                                        <option key={cst.CUST} value={cst.CUST}>{cst.CUSTDES}</option>
                                    ))}
                                </select> */}

                                <input
                                    className="form-control"
                                    list="customersList"
                                    value={custDes}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setCustDes(v);

                                        const match = customers.find(x => x.CUSTDES === v);
                                        setCust(match ? match.CUST : 0);
                                    }}
                                    placeholder="חפש לפי שם לקוח"
                                />

                                <datalist id="customersList">
                                    {customers.map((cst) => (
                                        <option key={cst.CUST} value={cst.CUSTDES} />
                                    ))}
                                </datalist>
                            </div>

                            <div className="col-md-12">
                                <button type="button" className="btn btn-secondary"
                                    style={{ backgroundColor: "#00adee", color: "white" }}
                                    onClick={createUser}>יצירת משתמש</button>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="card mt-3">
                    <div className="card-body p-3">
                        <h5 style={{ color: "#00adee" }}>שחזור סיסמה למשתמש</h5>

                        <div className="row g-3 text-white mt-3">
                            <div className="col-md-3">
                                <label className="form-label">שם משתמש<span className='text-danger'>*</span></label>
                                <input className="form-control" value={resetUsername} onChange={e => setResetUsername(e.target.value)} dir='ltr' />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">סיסמה חדשה<span className='text-danger'>*</span></label>
                                <input className="form-control" type='password' dir='ltr' value={resetPassword} onChange={e => setResetPassword(e.target.value)} />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">אימות סיסמה חדשה<span className='text-danger'>*</span></label>
                                <input className="form-control" type='password' dir='ltr' value={confirmPassword} onChange={e => setconfirmPassword(e.target.value)} />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">בחירת לקוח<span className='text-danger'>*</span></label>
                                <input
                                    className="form-control"
                                    list="customersList"
                                    value={restCustDes}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setResrtCustDes(v);
                                        const match = customers.find(x => x.CUSTDES === v);
                                        setResetCust(match ? match.CUST : 0);
                                    }}
                                    placeholder="חפש לפי שם לקוח"
                                />

                                <datalist id="customersList">
                                    {customers.map((cst) => (
                                        <option key={cst.CUST} value={cst.CUSTDES} />
                                    ))}
                                </datalist>
                            </div>

                            <div className="col-md-12">
                                <button type="button" className="btn btn-secondary"
                                    style={{ backgroundColor: "#00adee", color: "white" }}
                                    onClick={updatePassword}>שינוי סיסמה</button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <div className="col-md-12">
                <button type="button" className="btn btn-secondary me-3" onClick={clearForm}>
                    נקה טפסים
                </button>
            </div>

        </div>
    );
};
export default Users;