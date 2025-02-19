import { useLocation } from "react-router-dom";

function PaymentSuccessPage() {
    const location = useLocation();
    const success = location.state?.success;

    return (
        <div>
                <h1>결제가 성공적으로 완료되었습니다!</h1>
        </div>
    );
}

export default PaymentSuccessPage;
