import { useState, useCallback, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

const Customers = () => {
    const [address, setAddress] = useState('');
    const [address2, setAddress2] = useState('');
    const [address3, setAddress3] = useState('');
    const [phone, setPhone] = useState('');
    const [custdes, setCustdes] = useState('');
    const [zip, setZip] = useState('');
    const [accname, setAccname] = useState('');
    const [countryname, setCountryname] = useState('');
    const [wtaxnum, setWtaxnum] = useState('');
    const [vatnum, setVatnum] = useState('');
    const [city, setCity] = useState('');
    const [email, setEmail] = useState('');
    const [packagecust, setPackagecust] = useState(0);
    const [packageData, setPackageData] = useState([]);
    const [displayAlertMessage, setDisplayAlertMessage] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertMessageBody, setAlertMessageBody] = useState('');
    const [loading, setLoading] = useState(false);
    const handleClose = () => setDisplayAlertMessage(false);
    const [guid, setguid] = useState('');
    const [cust, setCust] = useState(null);
    const [isDisable, setIsDisable] = useState(false);
    /********************************************************************************************************************/
    const markDirty = (setter) => (e) => {
        setter(e.target.value);
        setIsDisable(true);
    };
    /********************************************************************************************************************/
    useEffect(() => {
        if (
            accname || custdes ||
            address || address2 || address3 ||
            city || zip || countryname ||
            phone || email ||
            wtaxnum || vatnum

        ) {
            setIsDisable(true);
        } else {
            setIsDisable(false);
        }
    }, [accname, custdes, address, address2, address3, city, zip, countryname, phone, email, wtaxnum, vatnum]);
    /********************************************************************************************************************/
    const getCustomer = useCallback(async () => {

        setLoading(true);

        try {
            const res = await fetch(`/cloudServer/getCustomer/${guid}`);
            if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

            const data = await res.json();
            if (data.length === 0) {
                setAlertMessage("❌ לא נמצא לקוח עם המזהה שסופק");
                setAlertMessageBody("אנא בדוק את המזהה ונסה שוב");
                setDisplayAlertMessage(true);
                return;
            } else {
                const customer = data[0];
                setAccname(customer.ACCNAME || '');
                setCustdes(customer.CUSTDES || '');
                setAddress2(customer.ADDRESS2 || '');
                setAddress3(customer.ADDRESS3 || '');
                setCity(customer.CITY || '');
                setZip(customer.ZIP || '');
                setPhone(customer.PHONE || '');
                setEmail(customer.EMAIL || '');
                setAddress(customer.ADDRESS || '');
                setWtaxnum(customer.WTAXNUM || '');
                setVatnum(customer.VATNUM || '');
                setCountryname(customer.COUNTRYNAME || '');
                setPackagecust(customer.PACKAGE || 0);
                setCust(customer.CUST || null);
            }

        } catch (err) {
            console.warn("❌ Something went wrong:", err);
        } finally {
            setLoading(false);
        }
    }, [guid]);
    /********************************************************************************************************************/
    const clearForm = () => {
        setAddress('');
        setAddress2('');
        setAddress3('');
        setPhone('');
        setCustdes('');
        setZip('');
        setAccname('');
        setCountryname('');
        setWtaxnum('');
        setVatnum('');
        setCity('');
        setEmail('');
        setPackagecust(0);
        setCust(null);
        setguid('');
        setIsDisable(false);
    }
    /********************************************************************************************************************/
    const getPackages = useCallback(async () => {
        try {
            const res = await fetch(`/cloudServer/packages`);
            if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

            const data = await res.json();
            setPackageData(data);

        } catch (err) {
            console.warn("❌ Something went wrong:", err);
        }
    }, []);
    /********************************************************************************************************************/
    useEffect(() => {
        getPackages();
    }, [getPackages]);
    /********************************************************************************************************************/
    async function createCustomer() {

        setLoading(true);

        const dataArray = {
            accname, custdes,
            address, address2, address3,
            city, zip, countryname,
            phone, email,
            wtaxnum, vatnum, packagecust:Number(packagecust)
        };

        if (!accname || !custdes || !phone || !email || !wtaxnum || !vatnum || !packagecust) {
            setAlertMessage(" יש שדות חובה חסרים⚠️");
            setAlertMessageBody("אנא מלא את כל השדות המסומנים בכוכבית אדומה");
            setDisplayAlertMessage(true);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`/cloudServer/createCustomer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dataArray })
            });

            const data = await res.json();

            if (res.ok) {
                console.log("✅ Prefix created successfully:", data);
                clearForm();
                setAlertMessage("✅ הלקוח נוצר בהצלחה");
                setDisplayAlertMessage(true);

            } else {
                console.warn("❌ Something went wrong", data.message);
            }

        } catch (err) {
            console.warn("❌ Something went wrong:", err);
        } finally {
            setLoading(false);
        }
    };
    /********************************************************************************************************************/
    async function updateCustomer() {

        setLoading(true);

        const dataArray = {
            accname, custdes,
            address, address2, address3,
            city, zip, countryname,
            phone, email,
            wtaxnum, vatnum, 
            packagecust:Number(packagecust), 
            cust:Number(cust)
        };

        if (!accname || !custdes || !phone || !email || !wtaxnum || !vatnum || !packagecust || !cust) {
            setAlertMessage(" יש שדות חובה חסרים⚠️");
            setAlertMessageBody("אנא מלא את כל השדות המסומנים בכוכבית אדומה");
            setDisplayAlertMessage(true);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`/cloudServer/updateCustomer`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dataArray })
            });

            const data = await res.json();

            if (res.ok) {
                console.log("✅ Prefix created successfully:", data);
                clearForm();
                setAlertMessage("✅ הלקוח עודכן בהצלחה");
                setDisplayAlertMessage(true);

            } else {
                console.warn("❌ Something went wrong", data.message);
            }

        } catch (err) {
            console.warn("❌ Something went wrong:", err);
        } finally {
            setLoading(false);
        }
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

                <h4 className='mb-3 fw-bold' style={{ color: "#00adee" }} >לקוחות</h4>

                <div className="card">
                    <div className="card-body p-3">
                        <h5 style={{ color: "#00adee" }}>יצירת לקוח חדש/עדכון</h5>

                        <div
                            className="row g-3 mt-3 align-items-end"
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
                                    onChange={(e) => setguid(e.target.value)}
                                    dir="ltr"
                                    disabled={isDisable}
                                />
                            </div>

                            <div className="col-md-3">
                                <button
                                    type="button"
                                    className="btn btn-secondary w-50"
                                    onClick={getCustomer}
                                    disabled={isDisable}
                                >
                                    שליפת לקוח
                                </button>
                            </div>
                        </div>


                        <div className="row g-3 text-white mt-3">
                            {/* Account */}
                            <div className="col-md-4">
                                <label className="form-label">מספר חשבון <span className='text-danger'>*</span></label>
                                <input className="form-control" value={accname} onChange={markDirty(setAccname)} dir='ltr' />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label">שם חברה <span className='text-danger'>*</span></label>
                                <input className="form-control" value={custdes} onChange={markDirty(setCustdes)} />
                            </div>

                            {/* Address */}
                            <div className="col-md-4">
                                <label className="form-label">כתובת 1</label>
                                <input className="form-control" value={address} onChange={markDirty(setAddress)} />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label">2 כתובת</label>
                                <input className="form-control" value={address2} onChange={markDirty(setAddress2)} />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label">3 כתובת</label>
                                <input className="form-control" value={address3} onChange={markDirty(setAddress3)} />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label">עיר</label>
                                <input className="form-control" value={city} onChange={markDirty(setCity)} />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label">מיקוד</label>
                                <input className="form-control" value={zip} onChange={markDirty(setZip)} />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label">מדינה</label>
                                <input className="form-control" value={countryname} onChange={markDirty(setCountryname)} />
                            </div>

                            {/* Contact */}
                            <div className="col-md-4">
                                <label className="form-label">טלפון/נייד <span className='text-danger'>*</span></label>
                                <input className="form-control" value={phone} onChange={markDirty(setPhone)} dir='ltr' />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label">דואר אלקטרוני <span className='text-danger'>*</span></label>
                                <input type="email" className="form-control" onChange={markDirty(setEmail)} dir='ltr' />
                            </div>

                            {/* Finance */}
                            <div className="col-md-4">
                                <label className="form-label">מספר חברה <span className='text-danger'>*</span></label>
                                <input className="form-control" value={wtaxnum} onChange={markDirty(setWtaxnum)} dir='ltr' />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label">מספר תיק במע"מ <span className='text-danger'>*</span></label>
                                <input className="form-control" value={vatnum} onChange={markDirty(setVatnum)} dir='ltr' />
                            </div>

                            {/* Package */}
                            <div className="col-md-4">
                                <label className="form-label">סוג חבילה <span className='text-danger'>*</span></label>
                                <select className="form-select mt-2" value={packagecust} onChange={markDirty(setPackagecust)}  >
                                    <option disabled value="">בחירת חבילה</option>
                                    {packageData.map((pkg) => (
                                        <option key={pkg.PACKAGE} value={pkg.PACKAGE}>{pkg.DES} - {Number(pkg.PRICE).toLocaleString()} ₪ - {pkg.TRANSACTION} פעולות</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-12">
                                {cust === null ?
                                    <>
                                        <button
                                            type="button"
                                            onClick={createCustomer}
                                            className="btn"
                                            style={{ backgroundColor: "#00adee", color: "white" }}>
                                            יצירת לקח
                                        </button>
                                    </> : <>
                                        <button
                                            type="button"
                                            onClick={updateCustomer}
                                            className="btn"
                                            style={{ backgroundColor: "#00adee", color: "white" }}>
                                            עדכון לקוח
                                        </button>
                                    </>}
                                <button type="button" className="btn ms-2 btn-secondary me-2" onClick={clearForm}>
                                    נקה טופס
                                </button>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};
export default Customers;