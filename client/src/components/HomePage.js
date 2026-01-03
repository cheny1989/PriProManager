import { useState, useEffect } from "react";
import logo from '../../src/PRIPRO-BG.png';

import Customers from "./modules/Customers";
import Packages from "./modules/Packages";
import Users from "./modules/Users";
import Billing from "./modules/Billing";

function HomePage({ setIsLoggedIn, user }) {
    const [fullscreenName, setFullscreenName] = useState(false);
    const [active, setActive] = useState("");

    const userName = user?.user || "";
    // const userId = user?.user_id || "";
    // const userGuid = user?.user_guid || "";
    // const custGuid = user?.cust_guid || "";
    /********************************************************************************************************************/
    const handleLogout = async () => {
        const token = localStorage.getItem("token");

        if (token) {
            await fetch("/logout", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
        }

        localStorage.removeItem("token");
        setIsLoggedIn(false);
    };
    /********************************************************************************************************************/
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
    /********************************************************************************************************************/
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
    /********************************************************************************************************************/
    const MenuItem = ({ id, label }) => (
        <button
            type="button"
            onClick={() => setActive(id)}
            className={`btnMenu btn btn-sm fw-bold rounded-0 border border-light d-flex align-items-center gap-2`}
            style={{ letterSpacing: "0.5px", color: active === id ? "#00adee" : "white" }}
        >
            {label}
        </button>
    );
    /********************************************************************************************************************/
    return (
        <div>
            <div
                className="App shadow-sm p-2"
                style={{
                    backgroundColor: "#00adee",
                    color: "white"
                }}
            >
                <div className="d-flex align-items-center justify-content-between p-1">
                    <div className="d-flex align-items-center gap-3">
                        <img
                            src={logo}
                            width="85rem"
                            alt="logo"
                            className="ms-1"
                            style={{ cursor: "pointer" }}
                            onClick={() => setActive("")}
                        />

                        <div
                            className="btn-sm text-white fw-bold d-flex align-items-center gap-2 rounded-0 border border-light px-2 py-1"
                            style={{
                                backgroundColor: "rgba(255,255,255,0.15)",
                                width: "auto",
                                cursor: "default",
                                height: "1.90rem"
                            }}
                        >
                            {userName}
                            <i className="bi bi-person me-2"></i>
                        </div>


                        <button
                            onClick={handleLogout}
                            className="btn btn-sm text-white fw-bold d-flex align-items-center gap-2 rounded-0 border border-light"
                        >
                            <i className="bi bi-box-arrow-left"></i>
                            התנתקות
                        </button>

                        <button
                            className="btn bg-transparent text-white btn-sm border-light rounded-0"
                            onClick={toggleFullscreen}
                        >
                            {fullscreenName ? (
                                <i className="bi bi-fullscreen-exit"></i>
                            ) : (
                                <i className="bi bi-arrows-fullscreen"></i>
                            )}
                        </button>

                        <h5 className="m-0">PriPro Manager</h5>

                    </div>
                </div>
            </div>

            <div dir="rtl">
                {/* Menu */}
                <div className="d-flex gap-2 p-2 border-bottom" style={{ backgroundColor: "#0b2a3a" }}>
                    <MenuItem id="customers" className="btnMenu" label="לקוחות" />
                    <MenuItem id="packages" className="btnMenu" label="חבילות" />
                    <MenuItem id="users" className="btnMenu" label="משתמשים" />
                    <MenuItem id="billing" className="btnMenu" label="חשבוניות" />
                </div>

                {/* Content */}
                <div className="p-3">
                    {active === "" ?
                        <div
                            className="text-center fs-4 fw-bold text-secondary mt-5"
                        > 
                            ברוכים הבאים למערכת ניהול PriPro Manager. <br />
                            אנא בחרו קטגוריה מהתפריט למעלה כדי להתחיל. </div>
                        : null}

                    {active === "customers" && <Customers />}
                    {active === "packages" && <Packages />}
                    {active === "users" && <Users />}
                    {active === "billing" && <Billing />}
                </div>
            </div>

        </div>
    );
}

export default HomePage;
