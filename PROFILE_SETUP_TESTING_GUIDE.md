# Profile Setup Page - Testing Guide

**Page URL:** `/settings/profile?setup=true`  
**Purpose:** Verify the aesthetic upgrade is working correctly

---

## ✅ Visual Tests (Desktop)

### 1. Hero Section

- [ ] Page loads with animated gradient orbs in background
- [ ] Sparkle icon (✨) displays in purple glowing badge
- [ ] Title text has gradient (purple → pink → blue)
- [ ] Progress bar shows correct percentage
- [ ] Progress bar animates smoothly on changes

### 2. Profile Picture Card

- [ ] Camera icon badge visible
- [ ] Card has glass morphism effect (semi-transparent)
- [ ] Hover effect: card lifts + glows
- [ ] Profile picture is 36x36 with gradient background
- [ ] Upload button has gradient (purple → blue)
- [ ] Completion checkmark appears after upload

### 3. Basic Information Card

- [ ] User icon badge visible
- [ ] All input fields have rounded xl borders
- [ ] Focus state shows purple ring glow
- [ ] Background lightens on focus
- [ ] Helper text displays below fields
- [ ] Completion checkmark when filled

### 4. Privacy Settings Card

- [ ] Shield icon badge visible
- [ ] Toggle switches are larger (8x16)
- [ ] Active switches have purple gradient + glow
- [ ] Inactive switches are gray
- [ ] Smooth 300ms transition on toggle
- [ ] Icons (Eye/EyeOff) display correctly

### 5. Contact & Links Card

- [ ] Link icon badge visible
- [ ] Phone and Website full width
- [ ] Instagram/YouTube in 2-column grid
- [ ] Platform-specific focus colors:
  - Instagram → Pink
  - YouTube → Red
  - X/Twitter → Blue

### 6. Music Samples Card

- [ ] Music icon badge visible
- [ ] Dashed border shows
- [ ] Large upload icon (64x64)
- [ ] Hover effect: border glows purple

### 7. Sticky Action Button

- [ ] Button stays at bottom while scrolling
- [ ] Frosted glass card background
- [ ] Button has gradient (purple → blue)
- [ ] Hover: scale + glow effect
- [ ] Arrow icon slides right on hover
- [ ] Disabled when username empty
- [ ] Shows spinner when saving

### 8. Profile Preview Card

- [ ] Only shows when username filled
- [ ] Gradient background (blue → purple)
- [ ] URL is underlined and clickable
- [ ] Hover changes link color

---

## ✅ Interaction Tests

### Form Interactions

- [ ] Can upload profile picture
- [ ] Can type in all input fields
- [ ] Can toggle privacy switches
- [ ] Can save profile
- [ ] Success message slides in from top
- [ ] Error message shows if save fails

### Progress Tracking

- [ ] Progress starts at 0% or 25% (privacy default)
- [ ] Increases when profile picture uploaded
- [ ] Increases when basic info completed
- [ ] Increases when social links added
- [ ] Progress bar animates smoothly
- [ ] Checkmarks appear on sections

### Navigation

- [ ] Can save and redirect works
- [ ] Redirect parameter preserved
- [ ] Profile URL link works

---

## ✅ Mobile Tests (< 640px)

### Layout

- [ ] Hero text is responsive (smaller on mobile)
- [ ] Cards are full width
- [ ] Profile picture is centered
- [ ] Upload button is full width
- [ ] Social links stack vertically (1 column)
- [ ] Sticky footer displays correctly
- [ ] Action button is full width

### Touch Interactions

- [ ] Toggle switches are easy to tap (44px)
- [ ] Buttons have adequate touch targets
- [ ] Input fields are easy to focus
- [ ] No horizontal scroll

---

## ✅ Animation Tests

### Page Load (in order)

1. [ ] Background orbs fade in
2. [ ] Hero section appears
3. [ ] Progress bar animates
4. [ ] Cards fade in sequentially

### Hover Effects

- [ ] Cards lift 2px on hover
- [ ] Shadow glow appears
- [ ] Border color changes to purple
- [ ] Buttons scale on hover
- [ ] Smooth 200ms transitions

### Success Flow

- [ ] Click save with valid data
- [ ] Success message slides in from top
- [ ] 2 second delay
- [ ] Redirect to dashboard or redirect param

---

## ✅ Accessibility Tests

### Keyboard Navigation

- [ ] Can tab through all fields
- [ ] Focus indicators visible (purple ring)
- [ ] Can toggle switches with keyboard
- [ ] Can activate buttons with Enter/Space

### Screen Reader

- [ ] Input labels are announced
- [ ] Helper text is associated
- [ ] Button states are clear
- [ ] Error messages are announced

### Color Contrast

- [ ] Text meets WCAG AA standards
- [ ] Focus indicators are visible
- [ ] Disabled states are clear

---

## ✅ Performance Tests

### Load Time

- [ ] Page loads in < 2 seconds
- [ ] No layout shift (CLS)
- [ ] Animations run at 60fps
- [ ] No janky scrolling

### Resource Usage

- [ ] No memory leaks
- [ ] Animations don't impact performance
- [ ] Images load optimally

---

## ✅ Browser Tests

### Chrome

- [ ] All features work
- [ ] Animations smooth
- [ ] Glass effect displays

### Firefox

- [ ] All features work
- [ ] Animations smooth
- [ ] Glass effect displays

### Safari

- [ ] All features work
- [ ] Animations smooth
- [ ] Backdrop blur works

### Mobile Safari

- [ ] Touch interactions work
- [ ] Animations smooth
- [ ] No iOS-specific issues

---

## 🐛 Common Issues to Check

### Visual Issues

- [ ] No text overflow
- [ ] No cut-off elements
- [ ] Gradient renders correctly
- [ ] Icons display properly
- [ ] Spacing is consistent

### Functional Issues

- [ ] File upload works
- [ ] Form validation works
- [ ] Save button enables/disables
- [ ] Redirect after save works
- [ ] Progress calculation accurate

### Edge Cases

- [ ] Very long username
- [ ] Very long bio (500+ chars)
- [ ] Special characters in fields
- [ ] Empty form submission
- [ ] Network error during save

---

## 🎯 Success Criteria

The upgrade is successful if:

1. ✅ **Visual Appeal**: Page looks modern, premium, world-class
2. ✅ **User Guidance**: Progress bar and checkmarks guide users
3. ✅ **Interactivity**: All hover/focus states work smoothly
4. ✅ **Responsiveness**: Works perfectly on all screen sizes
5. ✅ **Accessibility**: Meets WCAG AA standards
6. ✅ **Performance**: Smooth 60fps animations, fast load
7. ✅ **Functionality**: All features work as before
8. ✅ **No Regressions**: Nothing broke from the upgrade

---

## 🚀 Quick Test Flow

**5-Minute Smoke Test:**

1. Navigate to `/settings/profile?setup=true`
2. Check hero section loads with animation
3. Upload a profile picture
4. Fill in username, name, bio
5. Add at least one social link
6. Verify progress bar shows 100%
7. Click "Complete Setup"
8. Verify success message
9. Verify redirect works
10. Check mobile layout (resize browser)

**Result:** All steps should complete smoothly with no errors.

---

## 📸 Screenshot Checklist

Take screenshots of:

- [ ] Hero section on load
- [ ] Progress bar at 0%, 50%, 100%
- [ ] Card hover states
- [ ] Input focus states
- [ ] Toggle switches (on/off)
- [ ] Sticky footer button
- [ ] Success message
- [ ] Mobile layout
- [ ] Profile preview card

---

## 🔍 Debugging Tips

### If animations don't work:

- Check browser DevTools console for errors
- Verify `globals.css` changes deployed
- Check if user has "reduce motion" enabled

### If progress doesn't update:

- Check `sectionCompletion` state in React DevTools
- Verify `useEffect` for progress calculation runs
- Console.log the profile state

### If styles look wrong:

- Hard refresh (Cmd+Shift+R or Ctrl+Shift+F5)
- Clear browser cache
- Check if Tailwind classes compiled
- Verify no CSS conflicts

### If mobile layout breaks:

- Check viewport meta tag
- Verify Tailwind responsive classes
- Test in actual device (not just DevTools)

---

**Test Status:** ⏳ Awaiting deployment to production

**Tester:** **\*\*\*\***\_**\*\*\*\***  
**Date:** **\*\*\*\***\_**\*\*\*\***  
**Result:** ☐ Pass ☐ Fail  
**Notes:** **\*\*\*\***\_**\*\*\*\***
