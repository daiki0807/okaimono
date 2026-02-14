import { useState } from 'react';
import { RefreshCcw, Star, ShoppingBag, Rabbit, Cat, Dog, Heart, Lightbulb, EyeOff } from 'lucide-react';

// --- Types & Constants ---

type CoinType = 1 | 5 | 10 | 50 | 100 | 500;

interface CoinDef {
  value: CoinType;
  color: string;
  textColor: string;
  borderColor: string;
  size: string;
  label: string;
}

const COIN_DEFS: Record<CoinType, CoinDef> = {
  1: { value: 1, color: 'bg-gray-200', textColor: 'text-gray-600', borderColor: 'border-gray-300', size: 'w-10 h-10', label: '1' },
  5: { value: 5, color: 'bg-yellow-200', textColor: 'text-yellow-700', borderColor: 'border-yellow-400', size: 'w-11 h-11', label: '5' },
  10: { value: 10, color: 'bg-orange-300', textColor: 'text-orange-800', borderColor: 'border-orange-500', size: 'w-11 h-11', label: '10' },
  50: { value: 50, color: 'bg-gray-100', textColor: 'text-gray-700', borderColor: 'border-gray-300', size: 'w-10 h-10', label: '50' },
  100: { value: 100, color: 'bg-gray-300', textColor: 'text-gray-800', borderColor: 'border-gray-400', size: 'w-12 h-12', label: '100' },
  500: { value: 500, color: 'bg-yellow-100', textColor: 'text-yellow-800', borderColor: 'border-yellow-300', size: 'w-14 h-14', label: '500' },
};

const GOODS = [
  { name: 'りんご', emoji: '🍎' },
  { name: 'バナナ', emoji: '🍌' },
  { name: 'ぶどう', emoji: '🍇' },
  { name: 'いちご', emoji: '🍓' },
  { name: 'メロン', emoji: '🍈' },
  { name: 'ドーナツ', emoji: '🍩' },
  { name: 'ケーキ', emoji: '🍰' },
  { name: 'アイス', emoji: '🍦' },
  { name: 'キャンディ', emoji: '🍬' },
  { name: 'ハンバーガー', emoji: '🍔' },
  { name: 'おにぎり', emoji: '🍙' },
  { name: 'パン', emoji: '🍞' },
];

const ANIMAL_MESSAGES = {
  correct: ['すごいね！', 'やったー！', 'せいかい！', 'ばっちり！', '天才かも！'],
  incorrect: ['おしい！', 'もうすこし！', 'がんばって！', 'あれれ？', 'チャレンジ！'],
};

// --- Components ---

const Coin = ({ value, onClick, disabled = false }: { value: CoinType; onClick?: () => void; disabled?: boolean }) => {
  const def = COIN_DEFS[value];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${def.size} ${def.color} ${def.textColor} ${def.borderColor}
        rounded-full border-b-4 active:border-b-0 active:translate-y-1
        flex items-center justify-center font-bold shadow-md
        transition-all duration-100 m-1 select-none
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110 cursor-pointer'}
      `}
    >
      {def.label}
    </button>
  );
};

const Character = ({ mood }: { mood: 'neutral' | 'happy' | 'sad' }) => {
  return (
    <div className="flex flex-col items-center animate-bounce-slow">
      <div className={`
        w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl
        ${mood === 'happy' ? 'bg-pink-400' : mood === 'sad' ? 'bg-blue-400' : 'bg-orange-400'}
        transition-colors duration-500
      `}>
        {mood === 'happy' ? <Rabbit size={48} /> : mood === 'sad' ? <Cat size={48} /> : <Dog size={48} />}
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function OkaneApp() {
  const [level, setLevel] = useState<number>(0); // 0: Title, 1, 2, 3
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [trayAmount, setTrayAmount] = useState<number>(0);
  const [trayCoins, setTrayCoins] = useState<CoinType[]>([]);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [currentGood, setCurrentGood] = useState(GOODS[0]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showHint, setShowHint] = useState(false); // ヒント表示用のステート

  // レベルごとの設定
  const getLevelConfig = (lvl: number) => {
    switch (lvl) {
      case 1: // 100円玉のみ
        return { max: 900, step: 100, available: [100] as CoinType[] };
      case 2: // 100, 50, 10
        return { max: 900, step: 10, available: [100, 50, 10] as CoinType[] };
      case 3: // 全部
        return { max: 900, step: 1, available: [500, 100, 50, 10, 5, 1] as CoinType[] };
      default:
        return { max: 900, step: 100, available: [100] as CoinType[] };
    }
  };

  const generateProblem = (lvl: number) => {
    const config = getLevelConfig(lvl);
    let amount = 0;

    // ランダムな金額生成（0円は除外）
    do {
      if (lvl === 1) {
        amount = Math.floor(Math.random() * 9 + 1) * 100;
      } else if (lvl === 2) {
        amount = Math.floor(Math.random() * 89 + 1) * 10;
      } else {
        amount = Math.floor(Math.random() * 899 + 1);
      }
    } while (amount === 0 || amount > config.max);

    setTargetAmount(amount);
    setTrayAmount(0);
    setTrayCoins([]);
    setFeedback('none');
    setCurrentGood(GOODS[Math.floor(Math.random() * GOODS.length)]);
    setShowConfetti(false);
    setShowHint(false); // 新しい問題のときはヒントを隠す
  };

  const startGame = (selectedLevel: number) => {
    setLevel(selectedLevel);
    generateProblem(selectedLevel);
  };

  const addToTray = (value: CoinType) => {
    if (feedback === 'correct') return;
    setTrayCoins([...trayCoins, value]);
    setTrayAmount((prev) => prev + value);
    setShowHint(false); // 硬貨を動かしたらヒントを隠す（自分で数えるため）
  };

  const removeFromTray = (index: number) => {
    if (feedback === 'correct') return;
    const value = trayCoins[index];
    const newCoins = [...trayCoins];
    newCoins.splice(index, 1);
    setTrayCoins(newCoins);
    setTrayAmount((prev) => prev - value);
    setShowHint(false); // 硬貨を動かしたらヒントを隠す
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  const checkAnswer = () => {
    if (trayAmount === targetAmount) {
      setFeedback('correct');
      setShowConfetti(true);
      setShowHint(true); // 正解したら金額を表示する
    } else {
      setFeedback('incorrect');
      setTimeout(() => setFeedback('none'), 1500);
    }
  };

  const nextProblem = () => {
    generateProblem(level);
  };

  const returnToTitle = () => {
    setLevel(0);
    setFeedback('none');
  };

  // --- Render: Title Screen ---
  if (level === 0) {
    return (
      <div className="min-h-screen bg-orange-50 font-sans text-gray-800 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border-4 border-orange-200">
          <div className="flex justify-center mb-4">
            <ShoppingBag size={64} className="text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-orange-600">お店屋さんごっこ</h1>
          <p className="text-gray-500 mb-8">お金をだしておかいものをしよう！</p>

          <div className="space-y-4">
            <button onClick={() => startGame(1)} className="w-full bg-pink-400 hover:bg-pink-500 text-white font-bold py-4 px-6 rounded-2xl shadow-md transition transform hover:scale-105 flex items-center justify-between">
              <span className="flex items-center"><Star className="mr-2" size={20} /> レベル 1</span>
              <span className="text-sm bg-white/20 px-2 py-1 rounded">100円玉だけ</span>
            </button>
            <button onClick={() => startGame(2)} className="w-full bg-blue-400 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-2xl shadow-md transition transform hover:scale-105 flex items-center justify-between">
              <span className="flex items-center"><Star className="mr-1" size={20} /><Star className="mr-2" size={20} /> レベル 2</span>
              <span className="text-sm bg-white/20 px-2 py-1 rounded">50円・10円も</span>
            </button>
            <button onClick={() => startGame(3)} className="w-full bg-green-400 hover:bg-green-500 text-white font-bold py-4 px-6 rounded-2xl shadow-md transition transform hover:scale-105 flex items-center justify-between">
              <span className="flex items-center"><Star className="mr-1" size={20} /><Star className="mr-1" size={20} /><Star className="mr-2" size={20} /> レベル 3</span>
              <span className="text-sm bg-white/20 px-2 py-1 rounded">ぜんぶの硬貨</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Render: Game Screen ---
  const config = getLevelConfig(level);

  return (
    <div className="min-h-screen bg-orange-50 font-sans text-gray-800 flex flex-col items-center p-2 sm:p-4">

      {/* Header */}
      <div className="w-full max-w-lg flex justify-between items-center mb-4">
        <button onClick={returnToTitle} className="text-gray-500 hover:text-orange-500 flex items-center text-sm font-bold bg-white px-3 py-2 rounded-full shadow-sm">
          <RefreshCcw size={16} className="mr-1" /> やめる
        </button>
        <div className="bg-orange-200 text-orange-800 px-4 py-1 rounded-full text-sm font-bold">
          レベル {level}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-orange-100 relative">

        {/* Confetti Effect (Simple CSS implementation) */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-50 flex justify-center items-start overflow-hidden">
            <div className="w-full h-full bg-yellow-100/30 absolute animate-pulse"></div>
          </div>
        )}

        {/* Question Section */}
        <div className="bg-orange-100 p-6 flex flex-col items-center relative">
          <div className="text-6xl mb-2 filter drop-shadow-md animate-bounce-slow">
            {currentGood.emoji}
          </div>
          <div className="text-xl font-bold text-orange-800 mb-1">{currentGood.name}</div>
          <div className="bg-white px-6 py-2 rounded-2xl shadow-inner border-2 border-orange-200">
            <span className="text-4xl font-black text-gray-800">{targetAmount}</span>
            <span className="text-xl font-bold text-gray-600 ml-1">円</span>
          </div>

          {/* Character Feedback */}
          <div className="absolute top-2 right-2">
            <Character mood={feedback === 'correct' ? 'happy' : feedback === 'incorrect' ? 'sad' : 'neutral'} />
          </div>

          {/* Message Bubble */}
          <div className={`
            absolute top-4 left-4 bg-white p-3 rounded-xl rounded-tr-none shadow-md border-2 
            ${feedback === 'correct' ? 'border-pink-300 text-pink-600' : feedback === 'incorrect' ? 'border-blue-300 text-blue-600' : 'border-gray-200 text-gray-500'}
            transition-all duration-300 transform origin-bottom-right
            ${feedback !== 'none' ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
          `}>
            <p className="font-bold text-sm whitespace-nowrap">
              {feedback === 'correct'
                ? ANIMAL_MESSAGES.correct[Math.floor(Math.random() * ANIMAL_MESSAGES.correct.length)]
                : ANIMAL_MESSAGES.incorrect[Math.floor(Math.random() * ANIMAL_MESSAGES.incorrect.length)]}
            </p>
          </div>
        </div>

        {/* Tray Area (Drop Zone) */}
        <div className="p-4 bg-gray-50 border-t-2 border-dashed border-gray-300 min-h-[160px]">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-bold text-gray-400">ここにお金をおいてね</span>

            {/* Hint Section */}
            <div className="flex items-center">
              {showHint ? (
                <div className={`text-xl font-bold animate-pop-in ${trayAmount === targetAmount ? 'text-green-500' : trayAmount > targetAmount ? 'text-red-500' : 'text-gray-600'}`}>
                  いま：{trayAmount}円
                </div>
              ) : (
                <div className="text-xl font-bold text-gray-400">
                  いま：？ 円
                </div>
              )}

              {feedback !== 'correct' && (
                <button
                  onClick={toggleHint}
                  className={`ml-3 p-2 rounded-full shadow-sm transition-colors ${showHint ? 'bg-yellow-200 text-yellow-700' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                  title="ヒントをみる"
                >
                  {showHint ? <EyeOff size={18} /> : <Lightbulb size={18} />}
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 min-h-[100px] p-2 flex flex-wrap content-start shadow-inner">
            {trayCoins.length === 0 && (
              <div className="w-full h-20 flex items-center justify-center text-gray-300 text-sm">
                (したのお金をタップしてね)
              </div>
            )}
            {trayCoins.map((val, idx) => (
              <div key={idx} className="animate-pop-in">
                <Coin value={val} onClick={() => removeFromTray(idx)} disabled={feedback === 'correct'} />
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 pt-0 bg-gray-50 flex justify-center">
          {feedback === 'correct' ? (
            <button
              onClick={nextProblem}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white text-xl font-bold py-3 px-8 rounded-full shadow-lg transform transition active:scale-95 flex items-center justify-center animate-pulse"
            >
              つぎへすすむ <Heart className="ml-2 fill-white" size={24} />
            </button>
          ) : (
            <button
              onClick={checkAnswer}
              disabled={trayAmount === 0}
              className={`
                w-full text-xl font-bold py-3 px-8 rounded-full shadow-lg transform transition active:scale-95
                ${trayAmount === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white'}
              `}
            >
              これで はらう！
            </button>
          )}
        </div>

        {/* Wallet Area (Coin Palette) */}
        <div className="bg-orange-200 p-4 pb-8">
          <div className="text-center text-sm font-bold text-orange-800 mb-2">おさいふ</div>
          <div className="flex flex-wrap justify-center gap-2">
            {config.available.map((val) => (
              <Coin key={val} value={val} onClick={() => addToTray(val)} disabled={feedback === 'correct'} />
            ))}
          </div>
        </div>

      </div>

      {/* Styles for animations */}
      <style>{`
        @keyframes pop-in {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in {
          animation: pop-in 0.3s ease-out forwards;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
