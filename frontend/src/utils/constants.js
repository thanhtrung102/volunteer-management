// ==================== frontend/src/utils/constants.js ====================
export const CATEGORIES = [
  { value: '', label: 'Tất cả', icon: '🎯' },
  { value: 'tree_planting', label: 'Trồng cây', icon: '🌳' },
  { value: 'cleanup', label: 'Dọn dẹp', icon: '🧹' },
  { value: 'charity', label: 'Từ thiện', icon: '❤️' },
  { value: 'education', label: 'Giáo dục', icon: '📚' },
  { value: 'other', label: 'Khác', icon: '📌' },
];

export const getCategoryInfo = (category) => {
  return CATEGORIES.find(c => c.value === category) || CATEGORIES[CATEGORIES.length - 1];
};
