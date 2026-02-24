import { useState, useCallback, useEffect } from 'react';
import { CenteredMessageDialog } from "../CenteredMessageDialog";

const Users = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [cust, setCust] = useState(0);
    const [custDes, setCustDes] = useState("");
    const [active, setActive] = useState(true);
    const [userId, setUserId] = useState(0);
    const [userDes, setUserDes] = useState("");

    const [userOption, setUserOption] = useState("updateUser");
    const [usersByCust, setUsersByCust] = useState([]);

    // Messages
    const [displayMessage, setDisplayMessage] = useState(false);
    const [bodyMessage, setBodyMessage] = useState("");
    const [titleMessage, setTitleMessage] = useState("");
    const [colorMessage, setColorMessage] = useState("");
    const handleCloseDisplayMessage = () => setDisplayMessage(false);
    /********************************************************************************************************************/

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

    /********************************************************************************************************************/
    const cleanMessage = () => {
        setTitleMessage("");
        setBodyMessage("");
        setColorMessage("");
        setDisplayMessage("");
    }
    /********************************************************************************************************************/
    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const toggleConformPasswordVisibility = () => {
        setShowConfirmPassword((prev) => !prev);
    };

    const toggleResetPasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const toggleConformResetPasswordVisibility = () => {
        setShowConfirmPassword((prev) => !prev);
    };
    /********************************************************************************************************************/
    const getUsersByCust = useCallback(async () => {
        try {
            const res = await fetch(`/cloudServer/getUsersByCust/${cust}`);
            if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

            const data = await res.json();
            setUsersByCust(data);

        } catch (err) {
            setTitleMessage("משהו השתבש");
            setBodyMessage("יש לנסות שוב");
            setColorMessage("danger");
            setDisplayMessage(true);
            setTimeout(() => cleanMessage(), 2500);
            return;
        }
    }, [cust]);
    /********************************************************************************************************************/
    useEffect(() => {
        if (!cust) return;
        getUsersByCust();
    }, [cust, getUsersByCust]);
    /********************************************************************************************************************/
    async function updateUser() {

        setLoading(true);

        if (cust === 0 || !userId) {
            setTitleMessage("יש שדות חובה חסרים");
            setBodyMessage("אנא מלא את כל השדות המסומנים בכוכבית אדומה");
            setColorMessage("danger");
            setDisplayMessage(true);
            setTimeout(() => cleanMessage(), 2500);
            setLoading(false);
            return;
        }

        const dataArray = {
            userId: Number(userId),
            active: active
        };

        try {
            const res = await fetch(`/cloudServer/updateUser`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dataArray })
            });

            await res.json();

            if (res.ok) {
                clearForm();
                setTitleMessage("הלקוח עודכן בהצלחה");
                setBodyMessage(`המשתמש "${userDes}" עודכן בהצלחה עבור הלקוח "${custDes}" שנבחר`);
                setColorMessage("success");
                setDisplayMessage(true);
                setTimeout(() => cleanMessage(), 2500);
            } else {
                setTitleMessage("משהו השתבש");
                setBodyMessage("יש לנסות שוב");
                setColorMessage("danger");
                setDisplayMessage(true);
                setTimeout(() => cleanMessage(), 2500);
                return;
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
    }
    /********************************************************************************************************************/
    const getCustomers = useCallback(async () => {

        try {
            const res = await fetch(`/cloudServer/getCustomers`);
            if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

            const data = await res.json();
            setCustomers(data);

        } catch (err) {
            setTitleMessage("משהו השתבש");
            setBodyMessage("יש לנסות שוב");
            setColorMessage("danger");
            setDisplayMessage(true);
            setTimeout(() => cleanMessage(), 2500);
            return;
        }
    }, []);
    /********************************************************************************************************************/
    useEffect(() => {
        getCustomers();
    }, [getCustomers]);
    /********************************************************************************************************************/
    async function createUser() {

        setLoading(true);

        if (!username || !password || !confirmPassword || !cust) {
            setTitleMessage("יש שדות חובה חסרים");
            setBodyMessage("אנא מלא את כל השדות המסומנים בכוכבית אדומה");
            setColorMessage("danger");
            setDisplayMessage(true);
            setTimeout(() => cleanMessage(), 2500);
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setTitleMessage("הסיסמאות לא תואמות");
            setBodyMessage("אנא ודא שהסיסמה ואימות הסיסמה זהים");
            setColorMessage("danger");
            setDisplayMessage(true);
            setTimeout(() => cleanMessage(), 2500);
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
            setTitleMessage("הסיסמה החדשה לא עומדת בדרישות האבטחה");
            setBodyMessage("אנא ודא שהסיסמה החדשה כוללת לפחות 8 תווים, אותיות קטנות, אותיות גדולות, מספרים ותווים מיוחדים");
            setColorMessage("danger");
            setDisplayMessage(true);
            setTimeout(() => cleanMessage(), 2500);
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
                setTitleMessage("המשתמש כבר קיים ללקוח הזה");
                setBodyMessage(`שם המשתמש "${custDes}" כבר קיים עבור הלקוח שנבחר "${checkData.cust_des}". אנא בחר שם משתמש אחר`);
                setColorMessage("danger");
                setDisplayMessage(true);
                setTimeout(() => cleanMessage(), 2500);
                setLoading(false);
                return;
            }

            //----- Step 2: Create new user for cust
            const dataArray = {
                username,
                password,
                cust: Number(cust)
            };

            const res = await fetch("/cloudServer/createUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dataArray })
            });

            await res.json();

            if (res.ok) {
                clearForm();
                setTitleMessage("המשתמש נוצר בהצלחה");
                setBodyMessage(`המשתמש "${userDes}" נוצר בהצלחה עבור הלקוח "${custDes}" שנבחר`);
                setColorMessage("success");
                setDisplayMessage(true);
                setTimeout(() => cleanMessage(), 2500);
                setLoading(false);
                return;
            } else {
                setTitleMessage("משהו השתבש");
                setBodyMessage("יש לנסות שוב");
                setColorMessage("danger");
                setDisplayMessage(true);
                setTimeout(() => cleanMessage(), 2500);
                return;
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
    }
    /********************************************************************************************************************/
    async function updatePassword() {

        setLoading(true);

        if (!custDes || !password || !confirmPassword || !cust) {
            setTitleMessage("יש שדות חובה חסרים");
            setBodyMessage("אנא מלא את כל השדות המסומנים בכוכבית אדומה");
            setColorMessage("danger");
            setDisplayMessage(true);
            setTimeout(() => cleanMessage(), 2500);
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setTitleMessage("הסיסמאות לא תואמות");
            setBodyMessage("אנא ודא שהסיסמה ואימות הסיסמה זהים");
            setColorMessage("danger");
            setDisplayMessage(true);
            setTimeout(() => cleanMessage(), 2500);
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
            setTitleMessage("הסיסמה החדשה לא עומדת בדרישות האבטחה");
            setBodyMessage("אנא ודא שהסיסמה החדשה כוללת לפחות 8 תווים, אותיות קטנות, אותיות גדולות, מספרים ותווים מיוחדים");
            setColorMessage("danger");
            setDisplayMessage(true);
            setTimeout(() => cleanMessage(), 2500);
            setLoading(false);
            return;
        }

        try {

            const dataArray = {
                userId: Number(userId),
                password: password,
                cust: cust
            };

            const res = await fetch("/cloudServer/updatePassword", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dataArray })
            });

            await res.json();

            if (res.ok) {
                clearForm();
                setTitleMessage("הסיסמה עודכנה בהצלחה");
                setBodyMessage(`הסיסמה עבור המשתמש "${username}" עודכנה בהצלחה`);
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
                return;
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
    }
    /********************************************************************************************************************/
    const clearForm = () => {
        setUsername("");
        setPassword('');
        setCust(0);
        setCustDes("");
        setConfirmPassword('');
        setUsersByCust([]);
        setActive(true);
        setUserId(0);
        setUserOption("updateUser");
        setUserDes("");
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

                {/* Message - Start */}
                <CenteredMessageDialog
                    show={displayMessage}
                    title={titleMessage}
                    bodyMessage={bodyMessage}
                    colorMessage={colorMessage}
                    onClose={handleCloseDisplayMessage}
                />

                <h4 className='fw-bold' style={{ color: "#00adee" }} >משתמשים</h4>

                {/* -------  Select box -------*/}
                <select
                    className="form-select"
                    value={userOption}
                    onChange={(e) => {
                        setUserOption(e.target.value);
                        setUsername("");
                        setPassword('');
                        setConfirmPassword('');
                        setShowPassword(false);
                        setShowConfirmPassword(false);
                        setCust(0);
                        setCustDes("");
                        setActive(true);
                        setUserId(0);
                    }}
                >
                    <option value="" disabled={true}>בחירה</option>
                    <option value="updateUser">עדכון משתמש</option>
                    <option value="createUser">יצירת משתמש</option>
                    <option value="password">שחזור סיסמה למשתמש</option>
                </select>

                {/* ------- Box 1 -------*/}
                {userOption === "updateUser" && (
                    <div className="card mt-3">
                        <div className="card-body p-3">
                            <h5 style={{ color: "#00adee" }}>עדכון משתמש</h5>
                            <div className="row g-3 mt-3">

                                <div className="col-md-3">
                                    <label className="form-label">בחירת לקוח<span className='text-danger'>*</span></label>
                                    <input
                                        className="form-control"
                                        list="updateCustomersList"
                                        value={custDes}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setCustDes(v);
                                            const match = customers.find(x => x.CUSTDES === v);
                                            setCust(match ? match.CUST : 0);
                                        }}
                                        placeholder="חפש לפי שם לקוח"
                                    />

                                    <datalist id="updateCustomersList">
                                        {customers.map((cst) => (
                                            <option key={cst.CUST} value={cst.CUSTDES} />
                                        ))}
                                    </datalist>
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">שם משתמש<span className="text-danger">*</span></label>
                                    <select
                                        className="form-select"
                                        value={username}
                                        onChange={(e) => {
                                            const userId = e.target.value;
                                            setUsername(userId);
                                            const u = usersByCust.find(x => String(x.USER) === String(userId));
                                            setUserId(Number(u?.USER))
                                            setActive(Number(u?.ACTIVE) === 1);
                                            setUserDes(u?.USERNAME);
                                        }}
                                    >
                                        <option value="" disabled={true}>בחירת משתמש</option>
                                        {usersByCust.map((u) => (
                                            <option key={u.USER} value={u.USER}>
                                                {u.USERNAME}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">פעיל?<span className="text-danger">*</span></label>
                                    <select
                                        className="form-select"
                                        value={String(active)}
                                        onChange={(e) => setActive(e.target.value === "true")}
                                    >
                                        <option value="" disabled={true}>סטטוס</option>
                                        <option value="true" disabled={active === true}>פעיל</option>
                                        <option value="false" disabled={active === false}>לא פעיל</option>
                                    </select>
                                </div>

                                <div className="col-md-12">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        style={{ backgroundColor: "#00adee", color: "white" }}
                                        onClick={updateUser}
                                        disabled={!username}
                                    >עדכון משתמש
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                )}

                {/* ------- Box 2 -------*/}
                {userOption === "createUser" && (
                    <div className="card mt-3">
                        <div className="card-body p-3">
                            <h5 style={{ color: "#00adee" }}>יצירת משתמש</h5>
                            <div style={{ fontSize: "0.85rem" }} className='text-secondary mt-0 mb-3'>אנא ודא שהסיסמה החדשה כוללת לפחות 8 תווים, אותיות קטנות, אותיות גדולות, מספרים ותווים מיוחדים</div>

                            <div className="row g-3 mt-3">

                                <div className="col-md-3">
                                    <label className="form-label">בחירת לקוח<span className='text-danger'>*</span></label>
                                    <input
                                        className="form-control"
                                        list="updateCustomersList"
                                        value={custDes}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setCustDes(v);
                                            const match = customers.find(x => x.CUSTDES === v);
                                            setCust(match ? match.CUST : 0);
                                        }}
                                        placeholder="חפש לפי שם לקוח"
                                    />

                                    <datalist id="updateCustomersList">
                                        {customers.map((cst) => (
                                            <option key={cst.CUST} value={cst.CUSTDES} />
                                        ))}
                                    </datalist>
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">שם משתמש<span className="text-danger">*</span></label>
                                    <input
                                        className="form-control"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        dir='ltr'
                                    />
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">סיסמה<span className='text-danger'>*</span></label>
                                    <div className="input-group input-group" dir="ltr">
                                        <input
                                            className="form-control"
                                            type={showPassword ? 'text' : 'password'}
                                            dir='ltr'
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={togglePasswordVisibility}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                                        </button>
                                    </div>
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">אימות סיסמה<span className='text-danger'>*</span></label>
                                    <div className="input-group input-group" dir="ltr">
                                        <input
                                            className="form-control"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            dir="ltr"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            onPaste={(e) => e.preventDefault()}
                                            onDrop={(e) => e.preventDefault()}
                                            onCut={(e) => e.preventDefault()}
                                            onCopy={(e) => e.preventDefault()}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={toggleConformPasswordVisibility}
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                                        </button>
                                    </div>
                                </div>

                                <div className="col-md-12">
                                    <button type="button"
                                        className="btn btn-secondary"
                                        style={{ backgroundColor: "#00adee", color: "white" }}
                                        onClick={createUser}
                                        disabled={!username || !password || !confirmPassword || !cust}
                                    >יצירת משתמש
                                    </button>
                                </div>
                            </div>


                            <div className="password-rules mt-3 p-3 rounded-3 border bg-light" style={{ fontSize: "0.8rem" }}>
                                <div className="rules-title fw-bold mb-2">הסיסמה חייבת לכלול:</div>

                                <ul className="row g-2 list-unstyled mb-0" dir="rtl">

                                    <li className="col-12 col-md-2">
                                        <div className={`border rounded-2 p-2 bg-${!hasLowercase ? 'danger-subtle' : 'success-subtle text-decoration-line-through'} text-${!hasLowercase ? 'danger' : 'success'}`}>
                                            אות קטנה (a-z)
                                        </div>
                                    </li>

                                    <li className="col-12 col-md-2">
                                        <div className={`border rounded-2 p-2 bg-${!hasUppercase ? 'danger-subtle' : 'success-subtle text-decoration-line-through'} text-${!hasUppercase ? 'danger' : 'success'}`}>
                                            אות גדולה (A-Z)
                                        </div>
                                    </li>

                                    <li className="col-12 col-md-col-12 col-md-2">
                                        <div className={`border rounded-2 p-2 bg-${!hasNumbers ? 'danger-subtle' : 'success-subtle text-decoration-line-through'} text-${!hasNumbers ? 'danger' : 'success'}`}>
                                            ספרה (0-9)
                                        </div>
                                    </li>

                                    <li className="col-12 col-md-2">
                                        <div className={`border rounded-2 p-2 bg-${!hasSpecialChar ? 'danger-subtle' : 'success-subtle text-decoration-line-through'} text-${!hasSpecialChar ? 'danger' : 'success'}`}>
                                            תו מיוחד (!@#$...)
                                        </div>
                                    </li>

                                    <li className="col-12 col-md-2">
                                        <div className={`border rounded-2 p-2 bg-${!hasMinLength ? 'danger-subtle' : 'success-subtle text-decoration-line-through'} text-${!hasMinLength ? 'danger' : 'success'}`}>
                                            מינימום 8 תווים
                                        </div>
                                    </li>

                                    {password && confirmPassword && (
                                        <li className="col-12 col-md-2">
                                            <div className={`border rounded-2 p-2 bg-${confirmPassword !== password ? 'danger-subtle' : 'success-subtle text-decoration-line-through'} text-${confirmPassword !== password ? 'danger' : 'success'}`}>
                                                סיסמאות לא תואמות
                                            </div>
                                        </li>
                                    )}
                                </ul>
                            </div>


                        </div>
                    </div>
                )}

                {/* ------- Box 3 -------*/}
                {userOption === "password" && (
                    <div className="card mt-3">
                        <div className="card-body p-3">
                            <h5 style={{ color: "#00adee" }}>שחזור סיסמה למשתמש</h5>
                            <div style={{ fontSize: "0.85rem" }} className='text-secondary mt-0 mb-3'>אנא ודא שהסיסמה החדשה כוללת לפחות 8 תווים, אותיות קטנות, אותיות גדולות, מספרים ותווים מיוחדים</div>

                            <div className="row g-3 mt-3">

                                <div className="col-md-3">
                                    <label className="form-label">בחירת לקוח<span className='text-danger'>*</span></label>
                                    <input
                                        className="form-control"
                                        list="updateCustomersList"
                                        value={custDes}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setCustDes(v);
                                            const match = customers.find(x => x.CUSTDES === v);
                                            setCust(match ? match.CUST : 0);
                                        }}
                                        placeholder="חפש לפי שם לקוח"
                                    />

                                    <datalist id="updateCustomersList">
                                        {customers.map((cst) => (
                                            <option key={cst.CUST} value={cst.CUSTDES} />
                                        ))}
                                    </datalist>
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">שם משתמש<span className="text-danger">*</span></label>
                                    <select
                                        className="form-select"
                                        value={username}
                                        onChange={(e) => {
                                            const userId = e.target.value;
                                            setUsername(userId);
                                            const u = usersByCust.find(x => String(x.USER) === String(userId));
                                            setUserId(Number(u?.USER))
                                            setActive(Number(u?.ACTIVE) === 1);
                                            setUserDes(u?.USERNAME);
                                        }}
                                    >
                                        <option value="" disabled={true}>בחירת משתמש</option>
                                        {usersByCust.map((u) => (
                                            <option key={u.USER} value={u.USER}>
                                                {u.USERNAME}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">סיסמה חדשה<span className='text-danger'>*</span></label>
                                    <div className="input-group input-group" dir="ltr">
                                        <input
                                            className="form-control"
                                            type={showPassword ? 'text' : 'password'}
                                            dir='ltr'
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={toggleResetPasswordVisibility}
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                                        </button>
                                    </div>
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">אימות סיסמה<span className='text-danger'>*</span></label>
                                    <div className="input-group input-group" dir="ltr">
                                        <input
                                            className="form-control"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            dir="ltr"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            onPaste={(e) => e.preventDefault()}
                                            onDrop={(e) => e.preventDefault()}
                                            onCut={(e) => e.preventDefault()}
                                            onCopy={(e) => e.preventDefault()}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={toggleConformResetPasswordVisibility}
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                                        </button>
                                    </div>
                                </div>

                                <div className="col-md-12">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        style={{ backgroundColor: "#00adee", color: "white" }}
                                        onClick={updatePassword}
                                        disabled={!custDes || !password || !confirmPassword || !custDes}
                                    >שחזור סיסמה למשתמש
                                    </button>
                                </div>
                            </div>

                            <div className="password-rules mt-3 p-3 rounded-3 border bg-light" style={{ fontSize: "0.8rem" }}>
                                <div className="rules-title fw-bold mb-2">הסיסמה חייבת לכלול:</div>

                                <ul className="row g-2 list-unstyled mb-0" dir="rtl">

                                    <li className="col-12 col-md-2">
                                        <div className={`border rounded-2 p-2 bg-${!hasLowercase ? 'danger-subtle' : 'success-subtle text-decoration-line-through'} text-${!hasLowercase ? 'danger' : 'success'}`}>
                                            אות קטנה (a-z)
                                        </div>
                                    </li>

                                    <li className="col-12 col-md-2">
                                        <div className={`border rounded-2 p-2 bg-${!hasUppercase ? 'danger-subtle' : 'success-subtle text-decoration-line-through'} text-${!hasUppercase ? 'danger' : 'success'}`}>
                                            אות גדולה (A-Z)
                                        </div>
                                    </li>

                                    <li className="col-12 col-md-col-12 col-md-2">
                                        <div className={`border rounded-2 p-2 bg-${!hasNumbers ? 'danger-subtle' : 'success-subtle text-decoration-line-through'} text-${!hasNumbers ? 'danger' : 'success'}`}>
                                            ספרה (0-9)
                                        </div>
                                    </li>

                                    <li className="col-12 col-md-2">
                                        <div className={`border rounded-2 p-2 bg-${!hasSpecialChar ? 'danger-subtle' : 'success-subtle text-decoration-line-through'} text-${!hasSpecialChar ? 'danger' : 'success'}`}>
                                            תו מיוחד (!@#$...)
                                        </div>
                                    </li>

                                    <li className="col-12 col-md-2">
                                        <div className={`border rounded-2 p-2 bg-${!hasMinLength ? 'danger-subtle' : 'success-subtle text-decoration-line-through'} text-${!hasMinLength ? 'danger' : 'success'}`}>
                                            מינימום 8 תווים
                                        </div>
                                    </li>

                                    {password && confirmPassword && (
                                        <li className="col-12 col-md-2">
                                            <div className={`border rounded-2 p-2 bg-${confirmPassword !== password ? 'danger-subtle' : 'success-subtle text-decoration-line-through'} text-${confirmPassword !== password ? 'danger' : 'success'}`}>
                                                סיסמאות לא תואמות
                                            </div>
                                        </li>
                                    )}
                                </ul>
                            </div>

                        </div>
                    </div>
                )}


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