import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

import StorageManager from '../../components/account/storageManager/storageManager';
import FilesManager from '../../components/account/filesManager/filesManager';
import CTACard from '../../components/account/ctaCard/CTACard';
import FileUploader from '../../components/account/fileUploader/fileUploader';
import GradientBackgroundB from 'assets/illustrations/gradient-background-b';
import countly from 'lib/countly';
import { PageProps } from 'components/types';
import AppData from '../../content/pages/app/account.json';
import { useUploads } from 'components/contexts/uploadsContext';

enum CTACardTypes {
  API_TOKENS,
  READ_DOCS,
  UPLOAD_FILES,
}

const Account: React.FC = () => {
  const uploadModalState = useState(false);
  const dashboard = AppData.page_content.dashboard;
  const { uploads } = useUploads();

  const onFileUploead = useCallback(() => {
    uploadModalState[1](true);
  }, [uploadModalState]);

  const CTAConfigs = useMemo(
    () => ({
      [CTACardTypes.API_TOKENS]: {
        heading: dashboard.card_left.heading,
        description: dashboard.card_left.description,
        ctas: dashboard.card_left.ctas.map(cta => ({
          href: cta.link,
          variant: cta.theme,
          tracking: { ui: countly.ui[cta.ui], action: cta.action },
          children: <Link href={cta.link}>{cta.text}</Link>,
        })),
      },
      [CTACardTypes.READ_DOCS]: {
        heading: dashboard.card_center.heading,
        description: dashboard.card_center.description,
        ctas: dashboard.card_center.ctas.map(cta => ({
          href: cta.link,
          variant: cta.theme,
          tracking: { ui: countly.ui[cta.ui], action: cta.action },
          children: (
            <a href={cta.link} target="_blank" rel="noreferrer">
              {cta.text}
            </a>
          ),
        })),
      },
      [CTACardTypes.UPLOAD_FILES]: {
        heading: !!uploads.length ? dashboard.card_right.heading.option_1 : dashboard.card_right.heading.option_2,
        description: dashboard.card_right.description,
        ctas: dashboard.card_right.ctas.map(cta => ({
          onClick: onFileUploead,
          variant: cta.theme,
          tracking: { ui: countly.ui[cta.ui], action: cta.action, isFirstFile: !uploads.length },
          children: cta.text,
        })),
      },
    }),
    [uploads.length, onFileUploead, dashboard]
  );

  return (
    <>
      <div className="page-container account-container grid">
        <h3>{dashboard.heading}</h3>
        <div className="account-content">
          <StorageManager content={AppData.page_content.storage_manager} className="account-storage-manager" />
          <CTACard className="account-tokens-cta" {...CTAConfigs[CTACardTypes.API_TOKENS]} />
          <CTACard className="account-docs-cta" {...CTAConfigs[CTACardTypes.READ_DOCS]} />
          <CTACard
            className="account-upload-cta"
            {...CTAConfigs[CTACardTypes.UPLOAD_FILES]}
            background={<GradientBackgroundB className="account-gradient-background" />}
          />
          <FilesManager
            content={AppData.page_content.file_manager}
            className="account-files-manager"
            onFileUpload={onFileUploead}
          />
        </div>
        <FileUploader
          content={AppData.page_content.file_uploader}
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
      title: AppData.seo.title,
      redirectTo: '/login/',
      isRestricted: true,
    },
  };
}

export default Account;
