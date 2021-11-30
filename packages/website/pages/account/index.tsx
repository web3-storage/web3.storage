// import { useAppSelector } from 'store';

import StorageManager from '../../components/account/StorageManager';
import FilesManager from '../../components/account/FilesManager';
import GradientBackground from 'assets/illustrations/gradient-background';

const Account: React.FC = () => {
  return (
    <div className="page-container account-container">
      <h3>Account</h3>
      <div className="account-content">
        <StorageManager className="account-storage-manager" />
        <div className="section account-tokens-cta">TODO: Tokens CTA Content</div>
        <div className="section account-docs-cta">TODO: Docs CTA Content</div>
        <div className="section account-upload-cta">
          <GradientBackground className="account-gradient-background" />
        </div>
        <FilesManager className="account-files-manager" />
      </div>
    </div>
  );
};

export default Account;
