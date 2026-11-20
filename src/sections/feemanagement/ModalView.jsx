import styles from "./ModalView.module.css";
const ModalView = ({ viewOpen, viewClose, children }) => {
  if (!viewOpen) return null;
  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        {children}
        <div className={styles.profile}>
          <div className={styles.profileimg}></div>
          <div className={styles.profiledetails}>
            <div className={styles.profiledetailsname}>
              <h1>Brandon Dorward</h1>
            </div>
            <div className={styles.profiledetailsid}>
              <p>+91 8883031935</p> | <p>abc@gmail.com</p>
            </div>
          </div>
          <div className={styles.profileid}>
            <p>#1234567</p>
          </div>
        </div>
        <div className={styles.profile}>
          <div className={styles.profilebtns}>
            <p className={styles.p}>Date of Payment</p>
            <p className={styles.p1}>September 16, 2025</p>
          </div>
          <div className={styles.profilebtns}>
            <p className={styles.p}>Amount</p>
            <p className={styles.p1}>1,00,000.00</p>
          </div>
          <div className={styles.profilebtns}>
            <p className={styles.p}>Mode of Payment</p>
            <p className={styles.p1}>Online</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ModalView;
