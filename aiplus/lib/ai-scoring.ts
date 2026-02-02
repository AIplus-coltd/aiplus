/**
 * AI動画採点システム
 * 
 * 採点基準（合計100点）:
 * 1. 動画の長さ (20点) - 15-60秒が最適
 * 2. タイトルの質 (20点) - 10-50文字が最適
 * 3. 説明文の充実度 (15点) - 50文字以上
 * 4. ハッシュタグ (15点) - 3-7個が最適
 * 5. エンゲージメント (30点)
 *    - いいね数 (15点)
 *    - コメント数 (15点)
 */

interface VideoMetrics {
  // 動画情報
  duration?: number; // 動画の長さ（秒）
  title: string;
  description?: string;
  hashtags?: string[];
  
  // エンゲージメント
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
}

interface ScoreBreakdown {
  durationScore: number;
  titleScore: number;
  descriptionScore: number;
  hashtagScore: number;
  engagementScore: number;
  totalScore: number;
  feedback: string[];
}

/**
 * 動画の長さをスコアリング (20点満点)
 */
function scoreDuration(duration?: number): { score: number; feedback: string } {
  if (!duration || duration <= 0) {
    return { score: 10, feedback: "動画の長さ情報がありません" };
  }

  // 最適: 15-60秒 → 20点
  // 許容: 10-15秒 または 60-90秒 → 15点
  // それ以外 → 10点
  if (duration >= 15 && duration <= 60) {
    return { score: 20, feedback: "✓ 動画の長さは最適です" };
  } else if ((duration >= 10 && duration < 15) || (duration > 60 && duration <= 90)) {
    return { score: 15, feedback: "動画の長さを15-60秒にするとさらに良くなります" };
  } else if (duration < 10) {
    return { score: 10, feedback: "動画が短すぎます。15秒以上を推奨" };
  } else {
    return { score: 10, feedback: "動画が長すぎます。60秒以内を推奨" };
  }
}

/**
 * タイトルの質をスコアリング (20点満点)
 */
function scoreTitle(title: string): { score: number; feedback: string } {
  const length = title.length;
  
  if (length === 0) {
    return { score: 0, feedback: "タイトルが必要です" };
  }

  // 最適: 10-50文字 → 20点
  // 短い: 5-9文字 → 12点
  // 長い: 51-80文字 → 15点
  // その他 → 8点
  if (length >= 10 && length <= 50) {
    return { score: 20, feedback: "✓ タイトルの長さは最適です" };
  } else if (length >= 5 && length < 10) {
    return { score: 12, feedback: "タイトルをもう少し詳しくすると良いでしょう" };
  } else if (length > 50 && length <= 80) {
    return { score: 15, feedback: "タイトルが少し長いです。50文字以内を推奨" };
  } else if (length < 5) {
    return { score: 8, feedback: "タイトルが短すぎます。10文字以上を推奨" };
  } else {
    return { score: 8, feedback: "タイトルが長すぎます。50文字以内を推奨" };
  }
}

/**
 * 説明文の充実度をスコアリング (15点満点)
 */
function scoreDescription(description?: string): { score: number; feedback: string } {
  if (!description || description.trim().length === 0) {
    return { score: 0, feedback: "説明文を追加すると検索性が向上します" };
  }

  const length = description.trim().length;

  // 最適: 50文字以上 → 15点
  // 許容: 20-49文字 → 10点
  // 短い: 1-19文字 → 5点
  if (length >= 50) {
    return { score: 15, feedback: "✓ 詳細な説明文で検索性が高いです" };
  } else if (length >= 20) {
    return { score: 10, feedback: "説明文をもう少し詳しくすると良いでしょう" };
  } else {
    return { score: 5, feedback: "説明文を50文字以上にすることを推奨" };
  }
}

/**
 * ハッシュタグをスコアリング (15点満点)
 */
function scoreHashtags(hashtags?: string[]): { score: number; feedback: string } {
  if (!hashtags || hashtags.length === 0) {
    return { score: 0, feedback: "ハッシュタグを追加すると発見されやすくなります" };
  }

  const count = hashtags.length;

  // 最適: 3-7個 → 15点
  // 許容: 1-2個 または 8-10個 → 10点
  // 多すぎ: 11個以上 → 5点
  if (count >= 3 && count <= 7) {
    return { score: 15, feedback: "✓ ハッシュタグの数は最適です" };
  } else if (count <= 2 || (count >= 8 && count <= 10)) {
    return { score: 10, feedback: "ハッシュタグは3-7個が最適です" };
  } else {
    return { score: 5, feedback: "ハッシュタグが多すぎます。3-7個を推奨" };
  }
}

/**
 * エンゲージメントをスコアリング (30点満点)
 */
function scoreEngagement(likeCount = 0, commentCount = 0): { score: number; feedback: string } {
  // いいね数のスコア (15点満点)
  // 0-10: 3点, 11-50: 7点, 51-100: 11点, 101+: 15点
  let likeScore = 0;
  if (likeCount === 0) likeScore = 0;
  else if (likeCount <= 10) likeScore = 3;
  else if (likeCount <= 50) likeScore = 7;
  else if (likeCount <= 100) likeScore = 11;
  else likeScore = 15;

  // コメント数のスコア (15点満点)
  // 0-5: 3点, 6-20: 7点, 21-50: 11点, 51+: 15点
  let commentScore = 0;
  if (commentCount === 0) commentScore = 0;
  else if (commentCount <= 5) commentScore = 3;
  else if (commentCount <= 20) commentScore = 7;
  else if (commentCount <= 50) commentScore = 11;
  else commentScore = 15;

  const totalEngagement = likeScore + commentScore;

  let feedback = "";
  if (totalEngagement >= 25) {
    feedback = "✓ 高いエンゲージメント！素晴らしいコンテンツです";
  } else if (totalEngagement >= 15) {
    feedback = "良いエンゲージメントです。さらに視聴者と交流しましょう";
  } else if (totalEngagement > 0) {
    feedback = "エンゲージメントを高めるため、魅力的なコンテンツを心がけましょう";
  } else {
    feedback = "まだエンゲージメントがありません。シェアして視聴者を増やしましょう";
  }

  return { score: totalEngagement, feedback };
}

/**
 * 動画の総合AIスコアを計算
 */
export function calculateAIScore(metrics: VideoMetrics): ScoreBreakdown {
  const durationResult = scoreDuration(metrics.duration);
  const titleResult = scoreTitle(metrics.title);
  const descriptionResult = scoreDescription(metrics.description);
  const hashtagResult = scoreHashtags(metrics.hashtags);
  const engagementResult = scoreEngagement(metrics.likeCount, metrics.commentCount);

  const totalScore = Math.round(
    durationResult.score +
    titleResult.score +
    descriptionResult.score +
    hashtagResult.score +
    engagementResult.score
  );

  const feedback: string[] = [
    durationResult.feedback,
    titleResult.feedback,
    descriptionResult.feedback,
    hashtagResult.feedback,
    engagementResult.feedback,
  ];

  return {
    durationScore: durationResult.score,
    titleScore: titleResult.score,
    descriptionScore: descriptionResult.score,
    hashtagScore: hashtagResult.score,
    engagementScore: engagementResult.score,
    totalScore,
    feedback,
  };
}

/**
 * スコアレベルの判定
 */
export function getScoreLevel(score: number): {
  level: string;
  color: string;
  message: string;
} {
  if (score >= 90) {
    return {
      level: "S",
      color: "#ffd700",
      message: "最高品質！プロフェッショナルなコンテンツです",
    };
  } else if (score >= 80) {
    return {
      level: "A",
      color: "#c77dff",
      message: "優秀！非常に高品質なコンテンツです",
    };
  } else if (score >= 70) {
    return {
      level: "B",
      color: "#64b5f6",
      message: "良好！もう一歩で高評価です",
    };
  } else if (score >= 60) {
    return {
      level: "C",
      color: "#81c784",
      message: "普通。改善の余地があります",
    };
  } else {
    return {
      level: "D",
      color: "#ff6b6b",
      message: "要改善。フィードバックを参考に改善しましょう",
    };
  }
}
