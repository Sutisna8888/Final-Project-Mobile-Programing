import { getTimerColor, calculateProgress } from '../quizUtils';

describe('Quiz Utilities', () => {
  
  // Test Case 1: Cek Warna Timer
  describe('getTimerColor', () => {
    it('harus mengembalikan warna Biru jika waktu > 5 detik', () => {
      expect(getTimerColor(10)).toBe('#26C6DA');
      expect(getTimerColor(6)).toBe('#26C6DA');
    });

    it('harus mengembalikan warna Kuning jika waktu antara 4-5 detik', () => {
      expect(getTimerColor(5)).toBe('#FFA726');
      expect(getTimerColor(4)).toBe('#FFA726');
    });

    it('harus mengembalikan warna Merah jika waktu <= 3 detik', () => {
      expect(getTimerColor(3)).toBe('#EF5350');
      expect(getTimerColor(0)).toBe('#EF5350');
    });
  });

  // Test Case 2: Cek Progress Bar
  describe('calculateProgress', () => {
    it('harus menghitung persentase dengan benar', () => {
      expect(calculateProgress(0, 10)).toBe(10); 
      expect(calculateProgress(4, 10)).toBe(50);
    });

    it('harus mengembalikan 0 jika total soal 0 untuk menghindari error', () => {
      expect(calculateProgress(0, 0)).toBe(0);
    });
  });
});