document.addEventListener('DOMContentLoaded', () => {
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');
if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener('mousemove', e => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        follower.style.left = e.clientX + 'px';
        follower.style.top = e.clientY + 'px';
    });
    document.querySelectorAll('a, button, .project-card, .glass-hover').forEach(el => {
        el.addEventListener('mouseenter', () => follower.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => follower.classList.remove('cursor-hover'));
    });
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            if (!entry.target.classList.contains('hero-image-container')) {
                entry.target.classList.add('ray-flash');
                setTimeout(() => {
                    entry.target.classList.remove('ray-flash');
                }, 300);
            }

            if (entry.target.classList.contains('rating-counter')) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('.fade-in-up, .section-title, .rating-counter, .timeline-item, .skill-pill, .profile-card, .project-image-wrapper, .project-content, .timeline-dot').forEach(el => observer.observe(el));

function animateCounter(element) {
    const goal = parseInt(element.dataset.goal);
    let current = 0;
    const increment = Math.ceil(goal / 100);
    const interval = setInterval(() => {
        current += increment;
        if (current >= goal) {
            element.innerText = goal.toLocaleString();
            clearInterval(interval);
        } else {
            element.innerText = current.toLocaleString();
        }
    }, 20);
}

const timelineContentContainer = document.querySelector('#projects .space-y-24');
const path = document.querySelector('#timeline-path');
if (timelineContentContainer && path) {
    const setupTimelineAnimation = () => {
        const isMobile = window.innerWidth <= 768;
        const scrollableElement = isMobile ? window : document.querySelector('#projects .project-timeline-container');

        setTimeout(() => {
            const pathLength = timelineContentContainer.scrollHeight;
            const svg = path.ownerSVGElement;
            svg.style.height = `${pathLength}px`;
            svg.setAttribute('viewBox', `0 0 4 ${pathLength}`);
            svg.querySelectorAll('path').forEach(p => p.setAttribute('d', `M2 0 V ${pathLength}`));

            path.style.strokeDasharray = pathLength;
            path.style.strokeDashoffset = pathLength;

            const handleScroll = () => {
                let progress;

                if (isMobile) {
                    const section = document.querySelector('#projects');
                    const sectionTop = section.offsetTop;
                    const scrollTop = window.scrollY;
                    const scrollHeight = section.scrollHeight;
                    const containerHeight = window.innerHeight;
                    const scrollAmount = scrollTop - sectionTop;
                    const totalScrollable = scrollHeight - containerHeight;
                    progress = totalScrollable > 0 ? scrollAmount / totalScrollable : 1;
                } else {
                    const container = scrollableElement;
                    const scrollTop = container.scrollTop;
                    const scrollHeight = container.scrollHeight;
                    const containerHeight = container.clientHeight;
                    if (scrollHeight <= containerHeight) {
                        progress = 1;
                    } else {
                        progress = scrollTop / (scrollHeight - containerHeight);
                    }
                }

                progress = Math.max(0, Math.min(1, progress));
                const drawLength = pathLength * progress;
                path.style.strokeDashoffset = pathLength - drawLength;
            };

            if (window.handleTimelineScroll) {
                const oldScrollSource = window.lastUsedScrollSource;
                if (oldScrollSource) oldScrollSource.removeEventListener('scroll', window.handleTimelineScroll);
            }

            window.handleTimelineScroll = handleScroll;
            window.lastUsedScrollSource = scrollableElement;
            scrollableElement.addEventListener('scroll', window.handleTimelineScroll);
            handleScroll();
        }, 100);
    };

    window.addEventListener('load', setupTimelineAnimation);
    window.addEventListener('resize', setupTimelineAnimation);
}

const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');
async function handleSubmit(event) {
    event.preventDefault();
    const submitButton = document.getElementById('submit-button');
    const data = new FormData(event.target);
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    try {
        const response = await fetch(event.target.action, {
            method: form.method,
            body: data,
            headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
            statusEl.textContent = "Thanks! I'll get back to you soon.";
            statusEl.style.color = "lightgreen";
            form.reset();
        } else {
            const responseData = await response.json();
            statusEl.textContent = responseData.errors ? responseData.errors.map(error => error.message).join(", ") : "Oops! There was a problem submitting your form";
            statusEl.style.color = "red";
        }
    } catch (error) {
        statusEl.textContent = "Oops! There was a network problem.";
        statusEl.style.color = "red";
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Send Message";
    }
}
if (form) form.addEventListener("submit", handleSubmit);

const threadPath = document.getElementById('scroll-thread-path');
const threadContainer = document.getElementById('scroll-thread-container');
const nsLogo = document.getElementById('ns-logo');

function generateAndAnimateThread() {
    if (!threadPath || !threadContainer) return;

    const docHeight = document.documentElement.scrollHeight;
    const viewWidth = window.innerWidth;
    threadContainer.style.height = `${docHeight}px`;

    let pathData = `M ${viewWidth / 2}, 0`;
    let currentY = 0;
    let currentX = viewWidth / 2;
    const segmentHeight = 150;
    const horizontalVariance = viewWidth / 4;

    while (currentY < docHeight) {
        const nextY = currentY + segmentHeight;
        let nextX = currentX + (Math.random() - 0.5) * horizontalVariance;
        nextX = Math.max(viewWidth * 0.2, Math.min(viewWidth * 0.8, nextX));
        const controlY1 = currentY + segmentHeight / 3;
        const controlY2 = currentY + (segmentHeight / 3) * 2;
        const controlX1 = currentX + (Math.random() - 0.5) * 20;
        pathData += ` C ${controlX1}, ${controlY1}, ${nextX}, ${controlY2}, ${nextX}, ${nextY}`;
        currentX = nextX;
        currentY = nextY;
    }
    threadPath.setAttribute('d', pathData);

    const pathLength = threadPath.getTotalLength();
    threadPath.style.strokeDasharray = pathLength;
    threadPath.style.strokeDashoffset = pathLength;

    function handleScrollAnimation() {
        const scrollTop = window.scrollY;
        const winHeight = window.innerHeight;
        const scrollPercent = scrollTop / (docHeight - winHeight);
        const drawLength = pathLength * scrollPercent;
        threadPath.style.strokeDashoffset = Math.max(0, pathLength - drawLength);
    }

    if (window.handleThreadScroll) window.removeEventListener('scroll', window.handleThreadScroll);
    window.handleThreadScroll = handleScrollAnimation;
    window.addEventListener('scroll', window.handleThreadScroll, { passive: true });
    handleScrollAnimation();
}

window.addEventListener('load', generateAndAnimateThread);
window.addEventListener('resize', generateAndAnimateThread);

if (nsLogo) {
    nsLogo.addEventListener('click', () => {
        threadContainer.classList.toggle('hidden');
        if (!threadContainer.classList.contains('hidden')) {
            generateAndAnimateThread();
        }
    });
}

const profileImageContainer = document.getElementById('profile-image-container');
if (profileImageContainer) {
    profileImageContainer.addEventListener('click', () => {
        profileImageContainer.classList.remove('lightning-effect');
        void profileImageContainer.offsetWidth;
        profileImageContainer.classList.add('lightning-effect');
    });
}
});
