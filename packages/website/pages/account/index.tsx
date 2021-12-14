import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

import StorageManager from '../../components/account/storageManager/storageManager';
import FilesManager from '../../components/account/filesManager/filesManager';
import CTACard from '../../components/account/ctaCard/CTACard';
import FileUploader from '../../components/account/fileUploader/fileUploader';
import GradientBackgroundB from 'assets/illustrations/gradient-background-b';
import { ButtonVariant } from 'components/button/button';
import { PageProps } from 'components/types';

enum CTACardTypes {
  API_TOKENS,
  READ_DOCS,
  UPLOAD_FILES,
}

const Account: React.FC = () => {
  const uploadModalState = useState(false);

  const onFileUploead = useCallback(() => {
    uploadModalState[1](true);
  }, [uploadModalState]);
  const onReadDocs = useCallback(() => {
    window.alert('Read docs');
  }, []);

  const hasFiles = false; // TODO: Has files check
  const CTAConfigs = useMemo(
    () => ({
      [CTACardTypes.API_TOKENS]: {
        heading: 'API Tokens',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
        ctas: [
          {
            href: '/tokens?create=true',
            variant: ButtonVariant.PINK_BLUE,
            children: <Link href="/tokens?create=true">Create a Token</Link>,
          },
          {
            href: '/tokens',
            variant: ButtonVariant.OUTLINE_LIGHT,
            children: <Link href="/tokens">Manage Tokens</Link>,
          },
        ],
      },
      [CTACardTypes.READ_DOCS]: {
        heading: 'Read the docs',
        description: 'See the docs for guides and and walkthroughs',
        ctas: [{ onClick: onReadDocs, variant: ButtonVariant.PINK_BLUE, children: 'Explore the docs' }],
      },
      [CTACardTypes.UPLOAD_FILES]: {
        heading: `Upload ${hasFiles ? 'more' : 'your first'} file${hasFiles ? 's' : ''}`,
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        ctas: [{ onClick: onFileUploead, variant: ButtonVariant.OUTLINE_DARK, children: 'Upload Files' }],
      },
    }),
    [hasFiles, onFileUploead, onReadDocs]
  );

  return (
    <>
      <div className="page-container account-container">
        <h3>Account</h3>
        <div className="account-content">
          <StorageManager className="account-storage-manager" />
          <CTACard className="account-tokens-cta" {...CTAConfigs[CTACardTypes.API_TOKENS]} />
          <CTACard className="account-docs-cta" {...CTAConfigs[CTACardTypes.READ_DOCS]} />
          <CTACard
            className="account-upload-cta"
            {...CTAConfigs[CTACardTypes.UPLOAD_FILES]}
            background={<GradientBackgroundB className="account-gradient-background" />}
          />
          <FilesManager className="account-files-manager" />
        </div>
        <FileUploader
          uploadModalState={uploadModalState}
          background={<GradientBackgroundB className="account-gradient-background" />}
        />
      </div>
    </>
  );
};

export function getStaticProps(): { props: PageProps } {
  return {
    props: {
      title: 'Account - Web3 Storage',
      redirectTo: '/login/',
      isRestricted: true,
    },
  };
}

export default Account;
