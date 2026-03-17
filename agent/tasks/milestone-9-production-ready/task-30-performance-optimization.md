# Task 30: Performance optimization

## Objective
Code splitting, lazy loading, bundle optimization, CDN configuration.

## Context
Large bundle sizes slow initial load. Optimize for mobile users on slow connections by reducing bundle size, implementing lazy loading, and leveraging CDN caching.

## Steps

1. **Configure code splitting in TanStack Start**
   - Enable route-based code splitting
   - Split code by feature (editor, export, AI features)
   - Configure chunk naming for better debugging
   - Analyze bundle size to identify opportunities

2. **Lazy load heavy components**
   - Video editor: load only when user opens project
   - Effects panels: load on first access
   - Caption editor: load when captions generated
   - AI features: load on demand
   - Use React.lazy() and Suspense for lazy loading

3. **Analyze bundle size**
   - Install webpack-bundle-analyzer or equivalent
   - Generate bundle analysis report
   - Identify largest dependencies
   - Review opportunities to reduce size
   - Set up bundle size monitoring in CI

4. **Move heavy dependencies to separate chunks**
   - Split video processing libraries into separate chunk
   - Split AI/ML libraries into separate chunk
   - Split UI component libraries if large
   - Consider replacing heavy dependencies with lighter alternatives
   - Tree-shake unused code from dependencies

5. **Configure Cloud CDN for static assets**
   - Enable Cloud CDN for Cloud Run service
   - Configure cache headers for static assets
   - Set long cache duration for versioned assets (JS, CSS)
   - Set short cache for HTML files
   - Configure CDN to serve from edge locations

6. **Add compression**
   - Enable gzip compression in Cloud Run
   - Enable Brotli compression for modern browsers
   - Pre-compress static assets during build
   - Configure content-type headers correctly
   - Verify compression with browser dev tools

7. **Run Lighthouse audit and fix issues**
   - Run Lighthouse on dev/staging environments
   - Target score >90 for Performance
   - Fix identified issues (render-blocking resources, unused CSS)
   - Optimize images (compression, lazy loading, responsive)
   - Add resource hints (preconnect, prefetch)
   - Minimize main thread work

## Verification

- [ ] Lighthouse Performance score >90 on mobile
- [ ] Initial bundle size <200KB (gzipped)
- [ ] Route-based code splitting working correctly
- [ ] Heavy components lazy load on demand
- [ ] Bundle analysis report shows optimized dependencies
- [ ] Cloud CDN serves static assets with proper cache headers
- [ ] Gzip and Brotli compression enabled and working
- [ ] Page load time <3s on simulated 3G connection
- [ ] No render-blocking resources identified
- [ ] Images optimized and lazy loaded
- [ ] Web Vitals (LCP, FID, CLS) meet Core Web Vitals thresholds
- [ ] Bundle size monitoring configured in CI

## Estimated Time
5 hours
