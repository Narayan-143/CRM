import api from './client';

export const generateFollowUpEmail = async ({
  contactName,
  company,
  notes,
  dealTitle,
  dealStage,
  dealValue,
}) => {
  const response = await api.post('/ai/follow-up', {
    contactName,
    company,
    notes,
    dealTitle,
    dealStage,
    dealValue,
  });
  return response.data;
};
