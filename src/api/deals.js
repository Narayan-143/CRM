import api from './client';

export const getDeals = async () => {
  const response = await api.get('/deals');
  return response.data;
};

export const getDealById = async (id) => {
  const response = await api.get(`/deals/${id}`);
  return response.data;
};

export const createDeal = async (dealData) => {
  const response = await api.post('/deals', dealData);
  return response.data;
};

export const updateDeal = async (id, dealData) => {
  const response = await api.put(`/deals/${id}`, dealData);
  return response.data;
};

export const updateDealStage = async (id, stage) => {
  const response = await api.patch(`/deals/${id}/stage`, { stage });
  return response.data;
};

export const deleteDeal = async (id) => {
  const response = await api.delete(`/deals/${id}`);
  return response.data;
};
