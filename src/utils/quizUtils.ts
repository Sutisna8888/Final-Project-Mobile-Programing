export const getTimerColor = (timeLeft: number): string => {
  if (timeLeft > 5) return '#26C6DA'; 
  if (timeLeft > 3) return '#FFA726'; 
  return '#EF5350';                   
};
export const calculateProgress = (currentIndex: number, total: number): number => {
  if (total === 0) return 0;
  return ((currentIndex + 1) / total) * 100;
};