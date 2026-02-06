// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化应用
    initApp();
});

function initApp() {
    // 移除加载屏幕
    setTimeout(() => {
        const loadingScreen = document.querySelector('.loading-screen');
        loadingScreen.style.opacity = '0';
        loadingScreen.style.visibility = 'hidden';
        
        // 播放背景音乐
        const backgroundMusic = document.getElementById('backgroundMusic');
        backgroundMusic.volume = 0.4;
        
        // 自动播放音乐（需要用户交互，所以延迟到加载后）
        setTimeout(() => {
            if (backgroundMusic.paused) {
                backgroundMusic.play().catch(e => {
                    console.log("音频自动播放被阻止:", e);
                    // 显示音乐播放提示
                    showMusicPrompt();
                });
            }
        }, 1000);
        
        // 添加点击自动播放
        document.body.addEventListener('click', function initMusic() {
            if (backgroundMusic.paused) {
                backgroundMusic.play();
            }
            document.body.removeEventListener('click', initMusic);
        });
    }, 2000);
    
    // 初始化所有组件
    initNavIndicator();
    initMusicControl();
    initScrollListener();
    initAnimations();
    initProgressBar();
    initVideoEffects();
    initPhotoEffects();
}

// 显示音乐提示
function showMusicPrompt() {
    const prompt = document.createElement('div');
    prompt.className = 'music-prompt';
    prompt.innerHTML = `
        <div class="prompt-content">
            <p>点击任意位置开始播放背景音乐</p>
            <div class="prompt-icon">🎵</div>
        </div>
    `;
    document.body.appendChild(prompt);
    
    // 3秒后淡出
    setTimeout(() => {
        prompt.style.opacity = '0';
        setTimeout(() => prompt.remove(), 500);
    }, 3000);
}

// 初始化导航指示器
function initNavIndicator() {
    const indicatorDots = document.querySelector('.indicator-dots');
    const sections = document.querySelectorAll('.story-section');
    
    sections.forEach((section, index) => {
        const dot = document.createElement('div');
        dot.className = 'indicator-dot';
        if (index === 0) dot.classList.add('active');
        
        // 设置标题
        let title = "";
        if (index === 0) title = "封面";
        else if (index === 1) title = "相识";
        else if (index === 2) title = "陪伴";
        else if (index === 3) title = "特质";
        else if (index === 4) title = "秘密";
        else if (index === 5) title = "感动";
        else if (index === 6) title = "骄傲";
        else if (index === 7) title = "心里话";
        else if (index === 8) title = "音乐";
        
        dot.setAttribute('data-title', title);
        dot.setAttribute('data-index', index);
        
        // 点击导航到对应部分
        dot.addEventListener('click', function() {
            const sectionIndex = this.getAttribute('data-index');
            scrollToSection(sectionIndex);
        });
        
        indicatorDots.appendChild(dot);
    });
}

// 初始化音乐控制
function initMusicControl() {
    const musicToggle = document.getElementById('musicToggle');
    const musicStatus = document.getElementById('musicStatus');
    const backgroundMusic = document.getElementById('backgroundMusic');
    
    if (!musicToggle || !musicStatus || !backgroundMusic) return;
    
    musicToggle.addEventListener('click', function() {
        if (backgroundMusic.paused) {
            backgroundMusic.play();
            musicStatus.textContent = '暂停';
        } else {
            backgroundMusic.pause();
            musicStatus.textContent = '播放';
        }
    });
    
    // 添加键盘快捷键（M键控制音乐）
    document.addEventListener('keydown', function(e) {
        if (e.key.toLowerCase() === 'm') {
            musicToggle.click();
        }
    });
}

// 初始化滚动监听
function initScrollListener() {
    const sections = document.querySelectorAll('.story-section');
    const dots = document.querySelectorAll('.indicator-dot');
    const progressBar = document.getElementById('pageProgress');
    
    let isScrolling = false;
    
    // 监听滚动事件
    window.addEventListener('scroll', function() {
        if (isScrolling) return;
        
        isScrolling = true;
        
        let current = '';
        const scrollPosition = window.scrollY + window.innerHeight / 3;
        
        // 更新进度条
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        // 找到当前可见的部分
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        // 更新导航点状态
        dots.forEach(dot => {
            dot.classList.remove('active');
            const sectionIndex = dot.getAttribute('data-index');
            const targetSection = sections[sectionIndex];
            
            if (targetSection && targetSection.getAttribute('id') === current) {
                dot.classList.add('active');
            }
        });
        
        // 更新部分激活状态（视差效果）
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const isInViewport = (
                rect.top <= window.innerHeight * 0.75 &&
                rect.bottom >= window.innerHeight * 0.25
            );
            
            if (isInViewport && !section.classList.contains('active')) {
                section.classList.add('active');
                
                // 添加进入动画
                section.style.animation = 'none';
                setTimeout(() => {
                    section.style.animation = 'sectionAppear 1s ease forwards';
                }, 10);
            }
        });
        
        setTimeout(() => {
            isScrolling = false;
        }, 100);
    });
    
    // 添加键盘导航支持
    document.addEventListener('keydown', function(e) {
        const activeSection = document.querySelector('.story-section.active');
        const currentIndex = Array.from(sections).indexOf(activeSection);
        
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            if (currentIndex < sections.length - 1) {
                scrollToSection(currentIndex + 1);
            }
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            if (currentIndex > 0) {
                scrollToSection(currentIndex - 1);
            }
        } else if (e.key === 'Home') {
            e.preventDefault();
            scrollToSection(0);
        } else if (e.key === 'End') {
            e.preventDefault();
            scrollToSection(sections.length - 1);
        }
    });
    
    // 添加鼠标滚轮平滑滚动
    let scrollTimeout;
    window.addEventListener('wheel', function(e) {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            // 滚轮减速效果
        }, 150);
    }, { passive: true });
}

// 滚动到指定部分
function scrollToSection(index) {
    const sections = document.querySelectorAll('.story-section');
    if (sections[index]) {
        window.scrollTo({
            top: sections[index].offsetTop,
            behavior: 'smooth'
        });
        
        // 更新导航点状态
        const dots = document.querySelectorAll('.indicator-dot');
        dots.forEach(dot => dot.classList.remove('active'));
        dots[index].classList.add('active');
        
        // 触发该部分的动画
        sections[index].classList.add('active');
    }
}

// 初始化动画
function initAnimations() {
    // 添加CSS动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes sectionAppear {
            from {
                opacity: 0;
                transform: translateY(50px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        @keyframes floatUp {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }
        
        @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(135, 206, 235, 0.3); }
            50% { box-shadow: 0 0 40px rgba(135, 206, 235, 0.5); }
        }
        
        .music-prompt {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(10, 26, 45, 0.9);
            border: 2px solid var(--primary-color);
            border-radius: 15px;
            padding: 15px 25px;
            color: var(--primary-color);
            font-family: 'Montserrat', sans-serif;
            font-weight: 500;
            letter-spacing: 1px;
            z-index: 1001;
            backdrop-filter: blur(10px);
            transition: opacity 0.5s ease;
            animation: floatUp 3s ease-in-out infinite, glow 2s ease-in-out infinite;
        }
        
        .prompt-content {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .prompt-icon {
            font-size: 1.5rem;
        }
    `;
    document.head.appendChild(style);
    
    // 初始激活第一个部分
    document.querySelector('.story-section').classList.add('active');
    
    // 添加星光闪烁效果
    createTwinklingStars();
}

// 创建闪烁的星星
function createTwinklingStars() {
    const starField = document.querySelector('.star-field');
    if (!starField) return;
    
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'twinkling-star';
        star.style.cssText = `
            position: absolute;
            width: ${Math.random() * 3 + 1}px;
            height: ${Math.random() * 3 + 1}px;
            background: white;
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: twinkle ${Math.random() * 3 + 2}s infinite alternate;
            opacity: ${Math.random() * 0.5 + 0.2};
        `;
        starField.appendChild(star);
    }
    
    // 添加星星闪烁动画
    const starStyle = document.createElement('style');
    starStyle.textContent = `
        @keyframes twinkle {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
        }
    `;
    document.head.appendChild(starStyle);
}

// 初始化进度条
function initProgressBar() {
    const progressBar = document.getElementById('pageProgress');
    if (!progressBar) return;
    
    // 初始进度
    progressBar.style.width = '0%';
}

// 初始化视频特效
function initVideoEffects() {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
        // 添加悬停效果
        const videoFrame = video.closest('.video-frame');
        if (videoFrame) {
            videoFrame.addEventListener('mouseenter', () => {
                videoFrame.style.transform = 'perspective(1000px) rotateY(5deg) rotateX(2deg) scale(1.02)';
            });
            
            videoFrame.addEventListener('mouseleave', () => {
                videoFrame.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale(1)';
            });
        }
        
        // 添加播放时的特效
        video.addEventListener('play', () => {
            if (videoFrame) {
                videoFrame.style.boxShadow = 
                    '0 30px 60px rgba(0, 0, 0, 0.6), 0 0 80px rgba(135, 206, 235, 0.3)';
                
                // 添加播放指示器
                const indicator = document.createElement('div');
                indicator.className = 'video-playing-indicator';
                indicator.innerHTML = '▶ 正在播放';
                indicator.style.cssText = `
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    background: rgba(0, 0, 0, 0.7);
                    color: var(--primary-color);
                    padding: 5px 15px;
                    border-radius: 20px;
                    font-family: 'Montserrat', sans-serif;
                    font-size: 0.8rem;
                    font-weight: 600;
                    letter-spacing: 1px;
                    z-index: 10;
                    backdrop-filter: blur(5px);
                    border: 1px solid rgba(135, 206, 235, 0.3);
                    animation: glow 1.5s infinite alternate;
                `;
                
                if (videoFrame) {
                    videoFrame.appendChild(indicator);
                }
            }
        });
        
        video.addEventListener('pause', () => {
            if (videoFrame) {
                videoFrame.style.boxShadow = 
                    '0 25px 50px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.1)';
                
                const indicator = videoFrame.querySelector('.video-playing-indicator');
                if (indicator) {
                    indicator.remove();
                }
            }
        });
        
        video.addEventListener('ended', () => {
            if (videoFrame) {
                videoFrame.style.boxShadow = 
                    '0 25px 50px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.1)';
                
                const indicator = videoFrame.querySelector('.video-playing-indicator');
                if (indicator) {
                    indicator.remove();
                }
            }
        });
    });
    
    // 自动暂停非当前视频
    document.addEventListener('scroll', () => {
        videos.forEach(video => {
            const rect = video.getBoundingClientRect();
            const isVisible = (
                rect.top <= window.innerHeight * 0.8 &&
                rect.bottom >= window.innerHeight * 0.2
            );
            
            if (!isVisible && !video.paused) {
                video.pause();
                
                // 移除播放指示器
                const videoFrame = video.closest('.video-frame');
                if (videoFrame) {
                    const indicator = videoFrame.querySelector('.video-playing-indicator');
                    if (indicator) {
                        indicator.remove();
                    }
                }
            }
        });
    });
}

// 初始化照片效果
function initPhotoEffects() {
    const photos = document.querySelectorAll('.photo-item');
    
    photos.forEach(photo => {
        // 点击照片放大效果
        photo.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // 创建放大视图
            const overlay = document.createElement('div');
            overlay.className = 'photo-overlay-view';
            overlay.innerHTML = `
                <div class="overlay-content">
                    <button class="close-overlay">&times;</button>
                    <img src="${this.querySelector('img').src}" alt="${this.querySelector('h4').textContent}">
                    <div class="overlay-caption">
                        <h3>${this.querySelector('h4').textContent}</h3>
                        <p>${this.querySelector('p').textContent}</p>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';
            
            // 添加关闭功能
            const closeBtn = overlay.querySelector('.close-overlay');
            closeBtn.addEventListener('click', () => {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.remove();
                    document.body.style.overflow = '';
                }, 300);
            });
            
            // 点击背景关闭
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closeBtn.click();
                }
            });
            
            // 添加键盘关闭
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    closeBtn.click();
                }
            };
            document.addEventListener('keydown', handleKeyDown);
            
            // 移除事件监听器
            overlay.addEventListener('remove', () => {
                document.removeEventListener('keydown', handleKeyDown);
            });
        });
        
        // 悬停效果增强
        photo.addEventListener('mouseenter', function() {
            const tag = this.querySelector('.photo-tag');
            if (tag) {
                tag.style.opacity = '1';
                tag.style.transform = 'translateY(0)';
            }
        });
        
        photo.addEventListener('mouseleave', function() {
            const tag = this.querySelector('.photo-tag');
            if (tag) {
                tag.style.opacity = '0';
                tag.style.transform = 'translateY(-10px)';
            }
        });
    });
    
    // 添加照片放大样式
    const photoStyle = document.createElement('style');
    photoStyle.textContent = `
        .photo-overlay-view {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 2000;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            animation: fadeIn 0.3s ease forwards;
            backdrop-filter: blur(10px);
        }
        
        @keyframes fadeIn {
            to { opacity: 1; }
        }
        
        .overlay-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
            animation: scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        @keyframes scaleUp {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        
        .overlay-content img {
            max-width: 100%;
            max-height: 70vh;
            border-radius: 10px;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
        }
        
        .close-overlay {
            position: absolute;
            top: -40px;
            right: 0;
            background: rgba(10, 26, 45, 0.9);
            border: 2px solid var(--primary-color);
            color: var(--primary-color);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            font-size: 1.5rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            backdrop-filter: blur(5px);
        }
        
        .close-overlay:hover {
            background: var(--primary-color);
            color: var(--bg-dark);
            transform: scale(1.1);
        }
        
        .overlay-caption {
            text-align: center;
            margin-top: 20px;
            padding: 20px;
            background: rgba(10, 26, 45, 0.8);
            border-radius: 10px;
            border: 1px solid rgba(135, 206, 235, 0.3);
            backdrop-filter: blur(10px);
        }
        
        .overlay-caption h3 {
            font-family: 'Montserrat', sans-serif;
            font-size: 2rem;
            color: var(--primary-color);
            margin-bottom: 10px;
        }
        
        .overlay-caption p {
            font-size: 1.2rem;
            color: var(--text-gray);
            font-style: italic;
        }
    `;
    document.head.appendChild(photoStyle);
}

// 添加页面加载完成的动画
window.addEventListener('load', function() {
    // 添加一些初始动画
    const title = document.querySelector('.section-title');
    if (title) {
        title.style.animation = 'titleAppear 1.5s ease-out forwards';
        
        const titleStyle = document.createElement('style');
        titleStyle.textContent = `
            @keyframes titleAppear {
                0% {
                    opacity: 0;
                    transform: translateY(-50px) scale(0.9);
                    filter: blur(10px);
                }
                100% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                    filter: blur(0);
                }
            }
        `;
        document.head.appendChild(titleStyle);
    }
    
    // 添加照片墙延迟出现效果
    const photos = document.querySelectorAll('.photo-item');
    photos.forEach((photo, index) => {
        photo.style.animationDelay = `${index * 0.1}s`;
        photo.style.animation = 'photoAppear 0.8s ease-out forwards';
    });
    
    const photoAnimationStyle = document.createElement('style');
    photoAnimationStyle.textContent = `
        @keyframes photoAppear {
            0% {
                opacity: 0;
                transform: rotate(var(--rotate)) translateY(30px) scale(0.95);
            }
            100% {
                opacity: 1;
                transform: rotate(var(--rotate)) translateY(0) scale(1);
            }
        }
    `;
    document.head.appendChild(photoAnimationStyle);
});