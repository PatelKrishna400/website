/**
 * ==========================================================================
 * UNIVERSAL REWARDED INTERSTITIAL & DIRECT SPONSOR AD SERVICE (ZONE: 11677609)
 * Monetag Rewarded Interstitial SDK integration & Direct Ads Links
 * ==========================================================================
 */

const PASS_SPONSOR_LINKS_20 = [
  "https://uplcm.com/4/12169313",
  "https://uplcm.com/4/12169338",
  "https://uplcm.com/4/12169321",
  "https://uplcm.com/4/12169324",
  "https://uplcm.com/4/12169336",
  "https://uplcm.com/4/11834220",
  "https://uplcm.com/4/12169323",
  "https://uplcm.com/4/11616083",
  "https://uplcm.com/4/12169326",
  "https://uplcm.com/4/12169318",
  "https://uplcm.com/4/12169312",
  "https://uplcm.com/4/12169337",
  "https://uplcm.com/4/12169328",
  "https://uplcm.com/4/12169335",
  "https://uplcm.com/4/12169339",
  "https://uplcm.com/4/12169319",
  "https://uplcm.com/4/10684653",
  "https://uplcm.com/4/12169325",
  "https://uplcm.com/4/12169330",
  "https://uplcm.com/4/11834221"
];

function openSponsorAdLink(seed) {
  const i = Math.abs(parseInt(seed || Date.now(), 10)) % PASS_SPONSOR_LINKS_20.length;
  const link = PASS_SPONSOR_LINKS_20[i];
  try {
    const adTab = window.open(link, '_blank');
    if (adTab) {
      try { adTab.blur(); window.focus(); } catch (e) {}
    }
  } catch(err) {
    console.warn('[AdService] Sponsor link open note:', err);
  }
  return link;
}

// Backward-compat fallback if old zone function is called
if (typeof window.show_10691428 !== 'function' && typeof window.show_11677609 === 'function') {
  window.show_10691428 = window.show_11677609;
}

function runRewardedAd() {
  return new Promise((resolve) => {
    const onCompleted = () => {
      resolve({ success: true });
    };

    // Rewarded interstitial
    if (typeof window.show_11677609 === 'function') {
      window.show_11677609().then(() => {
        onCompleted();
      }).catch((err) => {
        console.warn('[AdService] Monetag ad notice:', err);
        onCompleted();
      });
    } else if (typeof show_11677609 === 'function') {
      show_11677609().then(() => {
        onCompleted();
      }).catch((err) => {
        console.warn('[AdService] Monetag ad notice:', err);
        onCompleted();
      });
    } else if (typeof window.show_10691428 === 'function') {
      window.show_10691428().then(() => {
        onCompleted();
      }).catch(() => {
        onCompleted();
      });
    } else {
      onCompleted();
    }
  });
}

window.PASS_SPONSOR_LINKS_20 = PASS_SPONSOR_LINKS_20;
window.openSponsorAdLink = openSponsorAdLink;
window.runRewardedAd = runRewardedAd;
window.AdService = {
  sponsorLinks: PASS_SPONSOR_LINKS_20,
  openSponsorAdLink: openSponsorAdLink,
  showWatchAd: runRewardedAd,
  runRewardedAd: runRewardedAd
};
