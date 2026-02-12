import { StudyFlowType } from '@vocably/model';
import { useContext } from 'react';
import { usePremium } from './usePremium';
import { UserMetadataContext } from './UserMetadataContainer';
import { defaultStudyFlow, filterStudyFlow } from '@vocably/srs';

export const useStudySteps = (): StudyFlowType[] => {
  const isPremium = usePremium();
  const {
    userMetadata: { studyFlow: studyFlowMetadata },
  } = useContext(UserMetadataContext);

  const studyFlow = studyFlowMetadata ?? defaultStudyFlow;

  return filterStudyFlow(studyFlow, isPremium);
};
