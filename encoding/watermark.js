const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

class Watermark {
    
    // Watermark qo'shish
    async addWatermark(inputPath, outputPath, watermarkPath, position = 'bottom-right') {
        const positions = {
            'top-left': '10:10',
            'top-right': 'main_w-overlay_w-10:10',
            'bottom-left': '10:main_h-overlay_h-10',
            'bottom-right': 'main_w-overlay_w-10:main_h-overlay_h-10',
            'center': '(main_w-overlay_w)/2:(main_h-overlay_h)/2'
        };
        
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .input(watermarkPath)
                .complexFilter([
                    {
                        filter: 'overlay',
                        options: { x: positions[position].split(':')[0], y: positions[position].split(':')[1] }
                    }
                ])
                .output(outputPath)
                .on('end', () => {
                    console.log('Watermark added successfully');
                    resolve(outputPath);
                })
                .on('error', reject)
                .run();
        });
    }

    // Matnli watermark qo'shish
    async addTextWatermark(inputPath, outputPath, text, options = {}) {
        const {
            font = 'Arial',
            fontSize = 24,
            fontColor = 'white',
            x = 10,
            y = 10,
            backgroundColor = 'black@0.5'
        } = options;
        
        const drawText = `drawtext=text='${text}':fontfile=${font}:fontsize=${fontSize}:fontcolor=${fontColor}:x=${x}:y=${y}:box=1:boxcolor=${backgroundColor}`;
        
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .videoFilter(drawText)
                .output(outputPath)
                .on('end', () => resolve(outputPath))
                .on('error', reject)
                .run();
        });
    }

    // Logo watermark
    async addLogoWatermark(inputPath, outputPath, logoPath, scale = 0.1) {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .input(logoPath)
                .complexFilter([
                    {
                        filter: 'scale',
                        options: `iw*${scale}:ih*${scale}`,
                        inputs: '1',
                        outputs: 'logo_scaled'
                    },
                    {
                        filter: 'overlay',
                        options: { x: 'W-w-10', y: 'H-h-10' },
                        inputs: ['0', 'logo_scaled']
                    }
                ])
                .output(outputPath)
                .on('end', () => resolve(outputPath))
                .on('error', reject)
                .run();
        });
    }
}

module.exports = new Watermark();
