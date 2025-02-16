import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function SocialLoginProccessPage() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);

        console.log("paramas : ", params)
        const accessToken = params.get("access") || "";
        const userId  = params.get("userId") || "";
        const email  = params.get("email") || "";

        localStorage.setItem('accessToken', accessToken); // ✅ localStorage에 저장
        localStorage.setItem('userId', userId);
        localStorage.setItem('userEmail', email);

        navigate("/main", {replace:true});
    }, []);

    return <></>;
}

export default SocialLoginProccessPage;