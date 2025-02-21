import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import styles from "./styles/green.module.scss";

interface AlertProps {
    message: string;
    onClose: () => void;
}

const GreenAlert = ({ message, onClose }: AlertProps) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    if (!visible) return null;

    return (
        <div className={styles.alert}>
            <AlertCircle className={styles.alert__icon} />
            <span className={styles.alert__message}>{message}</span>
        </div>
    );
}

export default GreenAlert;