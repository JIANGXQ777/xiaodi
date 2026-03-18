// 玉屏萧笛网站 - 动画系统

const App = {
    state: {
        isLoading: true,
        loaderProgress: 0,
        scrollProgress: 0,
        isMobile: window.innerWidth < 768,
        activeAudio: null,
        animationIds: []
    },

    init() {
        this.detectDevice();
        this.initEventListeners();
        this.initLoader();
        this.initCanvasAnimations();
        this.initScrollAnimations();
        this.initNavigation();
        this.initProductModal();
        this.initAudioVisualizer();
        this.initLazyLoad();
    },

    detectDevice() {
        this.state.isMobile = window.innerWidth < 768;
    },

    initEventListeners() {
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => {
                this.detectDevice();
                this.handleResize();
            }, 250);
        });

        window.addEventListener('scroll', () => {
            this.state.scrollProgress = window.pageYOffset / (document.body.scrollHeight - window.innerHeight);
        });
    },

    // 加载动画系统
    initLoader() {
        const loader = document.getElementById('loader');
        const loaderCanvas = document.getElementById('loader-ink-canvas');
        const leftScroll = document.querySelector('.loader-scroll.left');
        const rightScroll = document.querySelector('.loader-scroll.right');
        const chars = document.querySelectorAll('.loader-char');
        const seal = document.querySelector('.loader-seal');

        // 初始化加载画布
        if (loaderCanvas) {
            loaderCanvas.width = window.innerWidth;
            loaderCanvas.height = window.innerHeight;
            const inkSpread = new InkSpread(loaderCanvas);
            inkSpread.start();
        }

        // 卷轴展开动画
        setTimeout(() => {
            loader.classList.add('active');
        }, 100);

        // 文字动画
        chars.forEach((char, index) => {
            setTimeout(() => {
                char.classList.add('animating');
            }, 800 + index * 300);
        });

        // 印章动画
        setTimeout(() => {
            seal.classList.add('active');
        }, 2500);

        // 完成加载
        setTimeout(() => {
            this.loadComplete();
        }, 3500);
    },

    loadComplete() {
        this.state.isLoading = false;
        const loader = document.getElementById('loader');
        loader.classList.add('complete');

        setTimeout(() => {
            loader.style.display = 'none';
        }, 1000);
    },

    // 水墨背景系统
    initCanvasAnimations() {
        const heroCanvas = document.getElementById('ink-canvas');
        if (heroCanvas) {
            heroCanvas.width = window.innerWidth;
            heroCanvas.height = window.innerHeight;
            this.inkBackground = new InkBackground(heroCanvas);
            this.inkBackground.start();
        }
    },

    // 滚动动画系统
    initScrollAnimations() {
        this.scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    if (entry.target.classList.contains('timeline-item')) {
                        this.animateTimelineItem(entry.target);
                    }
                }
            });
        }, {
            threshold: 0.1
        });

        // 观察需要动画的元素
        document.querySelectorAll('.craft-item, .intro-card, .product-card, .timeline-item').forEach(el => {
            this.scrollObserver.observe(el);
        });
    },

    animateTimelineItem(element) {
        setTimeout(() => {
            element.classList.add('animated');
        }, 200);
    },

    // 导航系统
    initNavigation() {
        const links = document.querySelectorAll('.nav-links a');
        const sections = document.querySelectorAll('section[id]');

        links.forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    link.classList.add('clicking');
                    setTimeout(() => link.classList.remove('clicking'), 300);

                    window.scrollTo({
                        top: target.offsetTop - 60,
                        behavior: 'smooth'
                    });
                }
            });
        });

        const updateActiveLink = this.throttle(() => {
            const pos = window.pageYOffset + 100;

            sections.forEach(section => {
                const top = section.offsetTop;
                const height = section.offsetHeight;
                const id = section.getAttribute('id');

                if (pos >= top && pos < top + height) {
                    links.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#' + id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, 100);

        window.addEventListener('scroll', updateActiveLink);
    },

    // 产品模态框
    initProductModal() {
        const modal = document.getElementById('product-modal');
        const closeBtn = document.querySelector('.modal-close');

        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', () => {
                const productId = card.dataset.product;
                this.showProductModal(productId);
            });
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                modal.classList.remove('active');
            }
        });
    },

    showProductModal(id) {
        const modal = document.getElementById('product-modal');
        const img = document.getElementById('modal-img');
        const title = document.getElementById('modal-title');
        const desc = document.getElementById('modal-desc');

        const products = [
            {
                id: 1,
                title: '龙纹箫',
                desc: '黑底金纹・音色浑厚',
                image: '微信图片_20260317205032_1273_152.jpg'
            },
            {
                id: 2,
                title: '凤纹笛',
                desc: '精美雕刻・音色清越',
                image: '微信图片_20260317204104_1267_152.png'
            },
            {
                id: 3,
                title: '枫叶箫',
                desc: '自然纹理・寓意吉祥',
                image: '微信图片_20260317205031_1272_152.jpg'
            }
        ];

        const product = products.find(p => p.id == id);
        if (product) {
            img.src = product.image;
            title.textContent = product.title;
            desc.textContent = product.desc;
            modal.classList.add('active');
        }
    },

    // 音频可视化系统
    initAudioVisualizer() {
        const canvas = document.getElementById('audio-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        let animationId = null;
        const waves = [];

        class Wave {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.r = 0;
                this.maxR = Math.min(canvas.width, canvas.height) * 0.3;
                this.alpha = 0.5;
            }

            update() {
                this.r += 2;
                this.alpha = 0.5 * (1 - this.r / this.maxR);
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(26, 26, 26, ${this.alpha})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = waves.length - 1; i >= 0; i--) {
                waves[i].update();
                waves[i].draw();
                if (waves[i].alpha <= 0.01) waves.splice(i, 1);
            }

            animationId = requestAnimationFrame(animate);
        }

        let playing = null;
        let interval = null;

        document.querySelectorAll('.audio-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.audio;

                if (playing === id) {
                    item.classList.remove('playing');
                    playing = null;
                    clearInterval(interval);
                    waves.length = 0;
                    if (animationId) cancelAnimationFrame(animationId);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    return;
                }

                if (playing) {
                    const prevItem = document.querySelector(`.audio-item[data-audio="${playing}"]`);
                    prevItem.classList.remove('playing');
                }

                item.classList.add('playing');
                playing = id;

                if (!animationId) animate();

                interval = setInterval(() => {
                    if (playing === id) {
                        waves.push(new Wave(
                            canvas.width / 2 + (Math.random() - 0.5) * 200,
                            canvas.height / 2 + (Math.random() - 0.5) * 100
                        ));
                    }
                }, 400);
            });
        });
    },

    // 图片懒加载
    initLazyLoad() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        const lazyVideos = document.querySelectorAll('video[preload="metadata"]');

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        }, { threshold: 0.1 });

        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    video.load();
                    videoObserver.unobserve(video);
                }
            });
        }, { threshold: 0.1 });

        lazyImages.forEach(img => imageObserver.observe(img));
        lazyVideos.forEach(video => videoObserver.observe(video));
    },

    // 响应式调整
    handleResize() {
        const heroCanvas = document.getElementById('ink-canvas');
        if (heroCanvas) {
            heroCanvas.width = window.innerWidth;
            heroCanvas.height = window.innerHeight;
        }
    },

    // 工具函数
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// 水墨扩散动画类
class InkSpread {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.drops = [];
        this.init();
    }

    init() {
        // 创建墨滴
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        for (let i = 0; i < 5; i++) {
            this.drops.push(new InkDrop(centerX + (Math.random() - 0.5) * 100, centerY + (Math.random() - 0.5) * 100, 30));
        }
    }

    start() {
        this.animate();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drops.forEach(drop => {
            drop.update();
            drop.draw(this.ctx);
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

// 墨滴类
class InkDrop {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.maxRadius = radius * 8;
        this.alpha = 0.3;
        this.v = 0.5;
    }

    update() {
        if (this.radius < this.maxRadius) {
            this.radius += this.v;
            this.alpha *= 0.99;
        }
    }

    draw(ctx) {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, `rgba(26, 26, 26, ${this.alpha})`);
        gradient.addColorStop(1, 'rgba(26, 26, 26, 0)');

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

// 水墨背景类
class InkBackground {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.landscape = null;
        this.init();
    }

    init() {
        this.initParticles();
        this.initLandscape();
        this.initMouseInteraction();
    }

    initParticles() {
        const count = this.getParticleCount();
        for (let i = 0; i < count; i++) {
            this.particles.push(new InkParticle(this.canvas));
        }
    }

    initLandscape() {
        this.landscape = new InkLandscape(this.canvas);
    }

    initMouseInteraction() {
        this.mouse = { x: null, y: null };
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    getParticleCount() {
        if (App.state.isMobile) return 30;
        if (window.innerWidth < 1200) return 60;
        return 100;
    }

    start() {
        this.animate();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制背景山水
        if (this.landscape) {
            this.landscape.draw(this.ctx);
        }

        // 绘制粒子
        this.particles.forEach(particle => {
            particle.update(this.mouse);
            particle.draw(this.ctx);
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

// 水墨粒子类
class InkParticle {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
        this.alpha = Math.random() * 0.5 + 0.1;
    }

    update(mouse) {
        this.x += this.vx;
        this.y += this.vy;

        // 边界检测
        if (this.x < 0) this.x = this.canvas.width;
        if (this.x > this.canvas.width) this.x = 0;
        if (this.y < 0) this.y = this.canvas.height;
        if (this.y > this.canvas.height) this.y = 0;

        // 鼠标交互
        if (mouse.x !== null && mouse.y !== null) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
                const angle = Math.atan2(dy, dx);
                const force = (100 - dist) / 100;
                this.vx += Math.cos(angle) * force * 0.5;
                this.vy += Math.sin(angle) * force * 0.5;

                // 速度限制
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed > 2) {
                    this.vx = (this.vx / speed) * 2;
                    this.vy = (this.vy / speed) * 2;
                }
            }
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(26, 26, 26, ${this.alpha})`;
        ctx.fill();

        // 粒子连接（简化版）
    }
}

// 水墨山水类
class InkLandscape {
    constructor(canvas) {
        this.canvas = canvas;
        this.time = 0;
    }

    draw(ctx) {
        const { width, height } = this.canvas;

        // 绘制远山
        this.drawMountains(ctx, height * 0.2, height * 0.3, 0.001);
        this.drawMountains(ctx, height * 0.15, height * 0.25, 0.0015);
        this.drawMountains(ctx, height * 0.1, height * 0.2, 0.002);

        this.time += 0.01;
    }

    drawMountains(ctx, y, height, speed) {
        ctx.beginPath();
        ctx.moveTo(0, this.canvas.height);

        for (let x = 0; x <= this.canvas.width; x += 20) {
            const waveY = y + Math.sin(x * speed + this.time) * height;
            ctx.lineTo(x, waveY);
        }

        ctx.lineTo(this.canvas.width, this.canvas.height);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, 'rgba(26, 26, 26, 0.03)');
        gradient.addColorStop(1, 'rgba(26, 26, 26, 0.0)');
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    App.cleanup && App.cleanup();
});

// 错误处理
window.addEventListener('error', (e) => {
    console.error('页面错误:', e.message, e.filename, e.lineno);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('未处理的 Promise 拒绝:', e.reason);
});
