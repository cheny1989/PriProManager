import { useState, useEffect } from "react";
import logo from '../../src/PRIPRO-BG.png';

import Customers from "./customers/Customers";
import Packages from "./customers/Packages";
import Users from "./customers/Users";

function HomePage({ setIsLoggedIn, user }) {
    const [fullscreenName, setFullscreenName] = useState(false);

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
                <Customers />
                <Packages />
                <Users />
            </div>

        </div>
    );
}

export default HomePage;
