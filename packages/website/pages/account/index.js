import { useCallback, useMemo, useState } from 'react';

import analytics from 'lib/analytics';
import { useUploads } from 'components/contexts/uploadsContext';
import { useUser } from 'hooks/use-user';
import StorageManager from '../../components/account/storageManager/storageManager';
import FilesManager from '../../components/account/filesManager/filesManager';
import CTACard from '../../components/account/ctaCard/CTACard';
import FileUploader from '../../components/account/fileUploader/fileUploader';
import GradientBackground from '../../components/gradientbackground/gradientbackground.js';
import AppData from '../../content/pages/app/account.json';
import GeneralPageData from '../../content/pages/general.json';
import {
  shouldShowSunsetAnnouncement,
  useW3upLaunch,
  W3upMigrationRecommendationCopy,
} from '../../components/w3up-launch.js';
import * as PageBannerPortal from '../../components/page-banner/page-banner-portal.js';

export const CTACardTypes = {
  API_TOKENS: 'API_TOKENS',
  READ_DOCS: 'READ_DOCS',
  UPLOAD_FILES: 'UPLOAD_FILES',
};

const Account = () => {
  const uploadModalState = useState(false);
  const dashboard = AppData.page_content.dashboard;
  const { uploads } = useUploads();
  const user = useUser();

  const onFileUpload = useCallback(() => {
    uploadModalState[1](true);
  }, [uploadModalState]);

  const CTAConfigs = useMemo(
    () => ({
      [CTACardTypes.API_TOKENS]: {
        heading: dashboard.card_left.heading,
        description: dashboard.card_left.description,
        ctas: dashboard.card_left.ctas.map(cta => ({
          disabled: user?.info?.tags?.['HasAccountRestriction'] && cta.accountRestrictedText,
          href: cta.link,
          variant: cta.theme,
          tracking: { ui: analytics.ui[cta.ui], action: cta.action },
          children: cta.text,
          tooltip:
            user?.info?.tags?.['HasAccountRestriction'] && cta.accountRestrictedText
              ? cta.accountRestrictedText
              : undefined,
        })),
      },
      [CTACardTypes.READ_DOCS]: {
        heading: dashboard.card_center.heading,
        description: dashboard.card_center.description,
        ctas: dashboard.card_center.ctas.map(cta => ({
          href: cta.link,
          variant: cta.theme,
          tracking: { ui: analytics.ui[cta.ui], action: cta.action },
          children: (
            <a href={cta.link} target="_blank" rel="noreferrer noopener">
              {cta.text}
            </a>
          ),
        })),
      },
      [CTACardTypes.UPLOAD_FILES]: {
        heading: !!uploads.length ? dashboard.card_right.heading.option_1 : dashboard.card_right.heading.option_2,
        description: dashboard.card_right.description,
        ctas: dashboard.card_right.ctas.map(cta => ({
          disabled: user?.info?.tags?.['HasAccountRestriction'] && cta.accountRestrictedText,
          onClick: onFileUpload,
          variant: cta.theme,
          tracking: { ui: analytics.ui[cta.ui], action: cta.action, isFirstFile: !uploads.length },
          children: cta.text,
          tooltip:
            user?.info?.tags?.['HasAccountRestriction'] && cta.accountRestrictedText
              ? cta.accountRestrictedText
              : undefined,
        })),
      },
    }),
    [uploads.length, onFileUpload, dashboard, user]
  );
  const w3upLaunch = useW3upLaunch();
  return (
    <>
      {shouldShowSunsetAnnouncement(w3upLaunch) && (
        <PageBannerPortal.PageBanner>
          <W3upMigrationRecommendationCopy sunsetStartDate={w3upLaunch.sunsetStartDate} />
        </PageBannerPortal.PageBanner>
      )}
      <div className="page-container account-container">
        <h1 className="table-heading">{dashboard.heading}</h1>
        <div className="account-content">
          <StorageManager content={AppData.page_content.storage_manager} className="account-storage-manager" />
          <CTACard
            className="account-upload-cta"
            {...CTAConfigs[CTACardTypes.UPLOAD_FILES]}
            background={<GradientBackground variant="upload-cta-gradient-small" />}
          />
          <FilesManager
            content={AppData.page_content.file_manager}
            className="account-files-manager"
            onFileUpload={onFileUpload}
          />
        </div>
        <FileUploader
          content={AppData.page_content.file_uploader}
          uploadModalState={uploadModalState}
          background={<GradientBackground variant="upload-cta-gradient" />}
        />
      </div>
    </>
  );
};

/**
 * Static Props
 *
 * @returns {{ props: import('components/types').PageProps}}
 */
export function getStaticProps() {
  const crumbs = GeneralPageData.breadcrumbs;
  return {
    props: {
      title: AppData.seo.title,
      redirectTo: '/login/',
      isRestricted: true,
      breadcrumbs: [crumbs.index, crumbs.account],
    },
  };
}

export default Account;
