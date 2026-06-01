type FlowStepParam = {
  /**
   * Translation key for the step's display name (e.g. "studyFlow.mf").
   * Consumers should call `t(nameKey)` to render it.
   */
  nameKey: string;
};

const defaultFlowMap: Record<string | 'default', FlowStepParam> = {
  mf: { nameKey: 'studyFlow.mf' },
  sf: { nameKey: 'studyFlow.sf' },
  mb: { nameKey: 'studyFlow.mb' },
  ab: { nameKey: 'studyFlow.ab' },
  sb: { nameKey: 'studyFlow.sb' },
  default: { nameKey: 'studyFlow.default' },
};

export const getDefaultValues = (id: string) => {
  return defaultFlowMap[id] ?? defaultFlowMap.default;
};
