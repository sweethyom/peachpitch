import { Link } from "react-router-dom";
import styles from "./styles/Success.module.scss"

function PaymentSuccessPage() {

    return (
        <div className={styles.page}>
            <div className={styles.page__title}>결제가 성공적으로 완료되었습니다.</div>

            <Link to='../../main'>
                <div className={styles.page__btn}>메인으로 돌아가기</div>
            </Link>
        </div>
    );
}

export default PaymentSuccessPage;
