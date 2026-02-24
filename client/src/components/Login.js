import { useState, useEffect, useCallback } from "react";
import logo from '../../src/logo.png'
import HomePage from '../components/HomePage';
import { CenteredMessageDialog } from "../components/CenteredMessageDialog";

function Login() {
    /*********************************************************************************************************************/
    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fullscreenName, setFullscreenName] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [capsOn, setCapsOn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Messages
    const [displayMessage, setDisplayMessage] = useState(false);
    const [bodyMessage, setBodyMessage] = useState("");
    const [titleMessage, setTitleMessage] = useState("");
    const [colorMessage, setColorMessage] = useState("");
    const handleCloseDisplayMessage = () => setDisplayMessage(false);
    /*********************************************************************************************************************/
    const cleanMessage = () => {
        setTitleMessage("");
        setBodyMessage("");
        setColorMessage("");
        setDisplayMessage("");
    }
    /*********************************************************************************************************************/
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        (async () => {
            try {
                const res = await fetch("/cloudServer/protected", {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    localStorage.removeItem("token");
                    setIsLoggedIn(false);
                    return;
                }

                const data = await res.json();
                console.log(data)

                setUserDetails({
                    user: data.user,
                    user_id: data.user_id,
                    user_guid: data.user_guid,
                });
                setIsLoggedIn(true);

            } catch (e) {
                setIsLoggedIn(false);
            }
        })();
    }, []);
    /*********************************************************************************************************************/
    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };
    /*********************************************************************************************************************/
    const handleCaps = (e) => {
        setCapsOn(e.getModifierState && e.getModifierState("CapsLock"));
    };
    /*********************************************************************************************************************/
    const handleChangeUser = (e) => {
        setUser(e.target.value);
    };
    /*********************************************************************************************************************/
    const handleChangePassword = (e) => {
        setPassword(e.target.value);
    };
    /*********************************************************************************************************************/
    const loginConnection = useCallback(async (e) => {
        e.preventDefault();

        setLoading(true);

        if (!user || !password) {
            setLoading(false);
            setTitleMessage("יש למלא שם משתמש וסיסמה");
            setBodyMessage("נסה שוב");
            setColorMessage("danger");
            setDisplayMessage(true);
            setTimeout(() => cleanMessage(), 2500);
            return;
        }

        try {
            const res = await fetch("/cloudServer/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ user, password })
            });

            const data = await res.json();

            if (!res.ok) {

                setTitleMessage(data.message);
                setBodyMessage("נסה שוב");
                setColorMessage("danger");
                setDisplayMessage(true);
                setTimeout(() => cleanMessage(), 2500);
                return;
            }

            if (data.success && data.token) {
                localStorage.setItem("token", data.token);
                setIsLoggedIn(true);
                setUser("");
                setPassword("");
                console.log("token stored in localStorage:", data.token);

                setUserDetails({
                    user: data.userLogin,
                    user_id: data.user_id,
                    user_guid: data.user_guid,
                    token: data.token,
                });

                if (
                    !document.fullscreenElement
                ) {
                    toggleFullscreen();
                }

                const resProtected = await fetch("/cloudServer/protected", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${data.token}`
                    }
                });

                await resProtected.json();
            }

        } catch (err) {
            setTitleMessage("משהו התשבש");
            setBodyMessage("נסה שוב");
            setColorMessage("danger");
            setDisplayMessage(true);
            setTimeout(() => cleanMessage(), 2500);
            return;

        } finally {
            setLoading(false);
        }
    }, [user, password]);
    /*********************************************************************************************************************/
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFullscreen = !!(
                document.fullscreenElement ||
                document.mozFullScreenElement ||
                document.webkitFullscreenElement ||
                document.msFullscreenElement
            );
            setFullscreenName(isFullscreen);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);
    /*********************************************************************************************************************/
    const toggleFullscreen = () => {
        if (
            document.fullscreenElement ||
            document.mozFullScreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement
        ) {
            // Currently fullscreen, exit
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        } else {
            // Not fullscreen, request
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
        }
    };
    /*********************************************************************************************************************/
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Enter") {
                loginConnection(e);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [loginConnection]);
    /*********************************************************************************************************************/
    if (isLoggedIn) {
        return (
            <HomePage
                setIsLoggedIn={setIsLoggedIn}
                user={userDetails}
            />
        );
    }
    /*********************************************************************************************************************/
    return (
        <div>
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

            <div className="container mt-4" style={{ maxWidth: "50%" }} dir="rtl">

                <div className="d-flex gap-2 align-items-center" dir="ltr">
                    <img className='me-2 ms-2' src={logo} width="100rem" alt='logo'></img>

                    <button
                        className='btn border border-primary text-primary btn-sm px-3 py-1'
                        onClick={toggleFullscreen}
                    >
                        {fullscreenName ? <i className="bi bi-fullscreen-exit"></i> : <i className="bi bi-arrows-fullscreen"></i>}
                    </button>

                </div>

                <form onSubmit={loginConnection} className="mt-3">
                    <h3 className="mb-4 text-center fw-bold" style={{ color: "#00adee" }}>התחברות לחשבון מנהל</h3>
                    <hr />

                    {/* User */}
                    <div className="mb-3">
                        <label htmlFor="user" className="form-label fw-bold" style={{ color: "#00adee" }}>
                            שם משתמש
                            <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                            dir="ltr"
                            type="text"
                            className="form-control text-start"
                            name="user"
                            value={user}
                            onChange={handleChangeUser}
                            autoComplete="user"
                            id="user"
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label fw-bold" style={{ color: "#00adee" }}>
                            סיסמה
                            <span style={{ color: "red" }}>*</span>
                        </label>
                        <div className="input-group input-group" dir="ltr">
                            <input
                                dir="ltr"
                                // type="password"
                                type={showPassword ? 'text' : 'password'}
                                className="form-control text-start"
                                name="password"
                                value={password}
                                onChange={handleChangePassword}
                                id="password"
                                autoComplete="new-password"
                                onKeyDown={handleCaps}
                                onKeyUp={handleCaps}
                                onFocus={handleCaps}
                                onBlur={() => setCapsOn(false)}
                                aria-describedby="caps-warning"
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

                        {capsOn && (
                            <div id="caps-warning" style={{ marginTop: 6, color: "crimson", fontSize: 12 }} dir="ltr">
                                Caps Lock פעיל
                            </div>
                        )}
                    </div>

                    {/* Submit button */}
                    <button
                        className="btn btn-primary w-100 fw-bold"
                        disabled={loading}
                        style={{ backgroundColor: "#00adee", borderColor: "#00adee" }}
                    >
                        {loading ? 'טוען' : 'התחברות'}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default Login;
