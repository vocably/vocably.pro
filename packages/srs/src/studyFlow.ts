import { StudyFlowType } from '@vocably/model';

export const defaultStudyFlow: StudyFlowType[] = [
  {
    id: 'mf',
    enabled: true,
    type: 'multichoice',
  },
  {
    id: 'sf',
    enabled: true,
    type: 'card',
  },
  {
    id: 'mb',
    enabled: true,
    type: 'multichoice',
  },
  {
    id: 'ab',
    enabled: true,
    type: 'arrange',
  },
  {
    id: 'sb',
    enabled: true,
    type: 'card',
  },
];

export const filterStudyFlow = (
  flow: StudyFlowType[],
  isPremium: boolean
): StudyFlowType[] => {
  const excludedPremium = flow.filter((item) => {
    if (item.id === 'ab' && !isPremium) {
      return false;
    }

    return true;
  });

  const filteredFlow = excludedPremium.filter((item) => item.enabled);
  return filteredFlow.length === 0 ? excludedPremium : filteredFlow;
};
