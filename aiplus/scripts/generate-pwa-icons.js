const fs = require('fs');
const path = require('path');

// Sharp がインストールされていない場合のインストール手順を表示
const checkSharp = async () => {
  try {
    require.resolve('sharp');
    const sharp = require('sharp');
    return sharp;
  } catch (e) {
    console.error('❌ Sharp ライブラリがインストールされていません');
    console.log('\n次のコマンドを実行してください:');
    console.log('npm install --save-dev sharp');
    console.log('\nインストール後、再度このスクリプトを実行してください。');
    process.exit(1);
  }
};

const generateIcons = async () => {
  const sharp = await checkSharp();
  
  const inputFile = path.join(__dirname, '../public/logo/logo.svg');
  const outputDir = path.join(__dirname, '../public/icons');

  // アイコンディレクトリを作成
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 生成するアイコンサイズ
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

  console.log('🎨 PWAアイコンを生成中...\n');

  try {
    for (const size of sizes) {
      const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(inputFile)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(outputFile);
      
      console.log(`✅ ${size}x${size} アイコン生成完了: ${outputFile}`);
    }

    // Apple Touch Icon (192x192) を別途生成
    const appleTouchIcon = path.join(outputDir, 'apple-touch-icon.png');
    await sharp(inputFile)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(appleTouchIcon);
    
    console.log(`✅ Apple Touch Icon 生成完了: ${appleTouchIcon}`);
    
    // favicon.ico (32x32)
    const favicon = path.join(__dirname, '../public/favicon.ico');
    await sharp(inputFile)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(favicon);
    
    console.log(`✅ Favicon 生成完了: ${favicon}`);

    console.log('\n🎉 すべてのアイコン生成が完了しました！');
    console.log(`\n📂 アイコンは次の場所に保存されています:`);
    console.log(`   ${outputDir}`);
    
  } catch (error) {
    console.error('❌ アイコン生成中にエラーが発生しました:', error);
    process.exit(1);
  }
};

generateIcons();
