/**
 * ============================================================================
 * POWERUP SHOP CONTROLLER (Star Store & Ticket Store)
 * Free Rewards (+100 Coins, +1 Ticket), 5-Hour Unlock Cooldown & Real-Time Sync
 * ============================================================================
 */

// Safe Sound Effects Synthesizer using Web Audio API
const shopSfx = {
  playCoin: function() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, ctx.currentTime);
      osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  },
  playPurchase: function() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.07);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.14);
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.21);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.46);
    } catch (e) {}
  },
  playStarChime: function() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [659.25, 783.99, 987.77, 1318.51].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.26);
      });
    } catch (e) {}
  }
};
window.shopSfx = shopSfx;

// Balance variables
let userCoins = 0;
let userStars = 0;
let userTickets = 0;

// Reset all balances to zero initially per user requirement
function resetAllBalancesToZero() {
  try {
    localStorage.setItem('task_game_coins', '0');
    localStorage.setItem('user_coins', '0');
    localStorage.setItem('task_game_coins_alt', '0');
    localStorage.setItem('task_game_stars', '0');
    localStorage.setItem('user_stars', '0');
    localStorage.setItem('task_user_tickets', '0');
    localStorage.setItem('user_tickets', '0');
    localStorage.setItem('task_game_tickets', '0');
    localStorage.setItem('balance_zero_reset_v4', 'true');

    if (typeof window !== 'undefined' && window.firebaseSync) {
      if (typeof window.firebaseSync.setCoins === 'function') window.firebaseSync.setCoins(0);
      if (typeof window.firebaseSync.setStars === 'function') window.firebaseSync.setStars(0);
      if (typeof window.firebaseSync.setTickets === 'function') window.firebaseSync.setTickets(0);
    }
    syncAllBalances(0, 0, 0);
  } catch (e) {}
}
window.resetAllBalancesToZero = resetAllBalancesToZero;

// Trigger initial zero reset if not yet initialized for v4
try {
  if (!localStorage.getItem('balance_zero_reset_v4')) {
    resetAllBalancesToZero();
  }
} catch (e) {}

// ============================================================================
// 1-HOUR UNLOCK COOLDOWN SYSTEM (Updated per user requirement)
// ============================================================================
const SHOP_UNLOCK_STORAGE_KEY = 'task_game_shop_unlocks';
const SHOP_UNLOCK_DURATION_MS = 1 * 60 * 60 * 1000; // 1 hour = 3,600,000 ms

const SHOP_ITEMS = {
  'ad_coins': {
    btnId: 'btnWatchAdCoins',
    cardId: 'adCoinsCard',
    category: 'coin',
    defaultHtml: 'Watch Ad 📺',
    costCoins: 0,
    costStars: 0,
    rewardType: 'coins',
    rewardAmount: 100 // Adds only 100 coins
  },
  'star_pack_50': {
    btnId: 'btnBuyCoins50',
    cardId: 'starCard50',
    category: 'coin',
    defaultHtml: '50 ⭐',
    costCoins: 0,
    costStars: 50,
    rewardType: 'coins',
    rewardAmount: 3000
  },
  'coin_pack_50': {
    btnId: 'btnBuyCoins50',
    cardId: 'starCard50',
    category: 'coin',
    defaultHtml: '50 ⭐',
    costCoins: 0,
    costStars: 50,
    rewardType: 'coins',
    rewardAmount: 3000
  },
  'star_pack_100': {
    btnId: 'btnBuyCoins100',
    cardId: 'starCard100',
    category: 'coin',
    defaultHtml: '100 ⭐',
    costCoins: 0,
    costStars: 100,
    rewardType: 'coins',
    rewardAmount: 6000
  },
  'coin_pack_100': {
    btnId: 'btnBuyCoins100',
    cardId: 'starCard100',
    category: 'coin',
    defaultHtml: '100 ⭐',
    costCoins: 0,
    costStars: 100,
    rewardType: 'coins',
    rewardAmount: 6000
  },
  'star_pack_500': {
    btnId: 'btnBuyCoins500',
    cardId: 'starCard500',
    category: 'coin',
    defaultHtml: '500 ⭐',
    costCoins: 0,
    costStars: 500,
    rewardType: 'coins',
    rewardAmount: 30000
  },
  'coin_pack_500': {
    btnId: 'btnBuyCoins500',
    cardId: 'starCard500',
    category: 'coin',
    defaultHtml: '500 ⭐',
    costCoins: 0,
    costStars: 500,
    rewardType: 'coins',
    rewardAmount: 30000
  },
  'ad_tickets': {
    btnId: 'btnWatchAdTickets',
    cardId: 'adTicketsCard',
    category: 'ticket',
    defaultHtml: 'Watch Ad 📺',
    costCoins: 0,
    costStars: 0,
    rewardType: 'tickets',
    rewardAmount: 1 // Adds only 1 ticket
  },
  'ticket_pack_100': {
    btnId: 'btnBuyTickets100',
    cardId: 'ticketCard100',
    category: 'ticket',
    defaultHtml: '150 ⭐',
    costCoins: 0,
    costStars: 150,
    rewardType: 'tickets',
    rewardAmount: 100
  },
  'ticket_pack_500': {
    btnId: 'btnBuyTickets500',
    cardId: 'ticketCard500',
    category: 'ticket',
    defaultHtml: '750 ⭐',
    costCoins: 0,
    costStars: 750,
    rewardType: 'tickets',
    rewardAmount: 500
  },
  'ticket_pack_1000': {
    btnId: 'btnBuyTickets1000',
    cardId: 'ticketCard1000',
    category: 'ticket',
    defaultHtml: '1,500 ⭐',
    costCoins: 0,
    costStars: 1500,
    rewardType: 'tickets',
    rewardAmount: 1000
  }
};

function getShopUnlocks() {
  try {
    const raw = localStorage.getItem(SHOP_UNLOCK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveShopUnlocks(unlocks) {
  try {
    localStorage.setItem(SHOP_UNLOCK_STORAGE_KEY, JSON.stringify(unlocks));
  } catch (e) {}
}

function getItemUnlockRemaining(itemId) {
  const unlocks = getShopUnlocks();
  const expiresAt = unlocks[itemId];
  if (!expiresAt) return 0;
  const remaining = expiresAt - Date.now();
  if (remaining <= 0) {
    delete unlocks[itemId];
    saveShopUnlocks(unlocks);
    return 0;
  }
  return remaining;
}

function startItemUnlock(itemId, durationMs = SHOP_UNLOCK_DURATION_MS) {
  const unlocks = getShopUnlocks();
  unlocks[itemId] = Date.now() + durationMs;
  saveShopUnlocks(unlocks);
  updateShopTimers();
}

function formatRemainingTime(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const hh = h.toString().padStart(2, '0');
  const mm = m.toString().padStart(2, '0');
  const ss = s.toString().padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function updateShopTimers() {
  let anyStateChanged = false;
  const currentCoins = parseInt(localStorage.getItem('task_game_coins') || localStorage.getItem('user_coins') || '0', 10) || 0;
  const currentStars = parseInt(localStorage.getItem('task_game_stars') || localStorage.getItem('user_stars') || '0', 10) || 0;
  const currentTickets = parseInt(localStorage.getItem('task_user_tickets') || localStorage.getItem('user_tickets') || localStorage.getItem('task_game_tickets') || '0', 10) || 0;

  Object.entries(SHOP_ITEMS).forEach(([itemId, meta]) => {
    const btn = document.getElementById(meta.btnId);
    if (!btn) return;

    const remaining = getItemUnlockRemaining(itemId);

    if (remaining > 0) {
      // Cooldown active: lock button and show live countdown
      const formatted = formatRemainingTime(remaining);
      btn.disabled = true;
      btn.classList.add('btn-disabled-cooldown');
      btn.classList.remove('btn-affordable');
      btn.innerHTML = `<span class="cooldown-timer-tab">⏱️ ${formatted}</span>`;
    } else {
      // Cooldown ended: hide the timer once the unlock period ends!
      if (btn.classList.contains('btn-disabled-cooldown')) {
        btn.classList.remove('btn-disabled-cooldown');
        btn.disabled = false;
        btn.innerHTML = meta.defaultHtml;
        anyStateChanged = true;
      } else if (!btn.innerHTML || btn.innerHTML.includes('cooldown-timer-tab')) {
        btn.innerHTML = meta.defaultHtml;
        btn.disabled = false;
      }

      // Check affordability
      let affordable = false;
      if (meta.costCoins > 0) {
        affordable = (currentCoins >= meta.costCoins);
      } else if (meta.costStars > 0) {
        affordable = (currentStars >= meta.costStars);
      } else if (meta.costTickets > 0) {
        affordable = (currentTickets >= meta.costTickets);
      } else {
        affordable = true;
      }

      if (affordable) {
        btn.classList.add('btn-affordable');
      } else {
        btn.classList.remove('btn-affordable');
      }
    }
  });

  if (anyStateChanged) {
    updateShopButtonAffordability();
  }
}

// Tick timers every second
setInterval(updateShopTimers, 1000);

// ============================================================================
// TAB SWITCHING (All Items, Tickets, Coins - Tabs Removed, Shows All Items)
// ============================================================================
function switchShopTab(tab) {
  tab = 'all';
  try {
    localStorage.removeItem('task_game_shop_active_tab');
  } catch (e) {}

  const tabAll = document.getElementById('shopTabAll');
  const tabTickets = document.getElementById('shopTabTickets');
  const tabCoins = document.getElementById('shopTabCoins');

  if (tabAll) tabAll.classList.toggle('active', true);
  if (tabTickets) tabTickets.classList.toggle('active', false);
  if (tabCoins) tabCoins.classList.toggle('active', false);

  const coinItems = document.querySelectorAll('.shop-item-coin');
  const ticketItems = document.querySelectorAll('.shop-item-ticket');

  coinItems.forEach(el => el.style.display = '');
  ticketItems.forEach(el => el.style.display = '');
}
window.switchShopTab = switchShopTab;

// ============================================================================
// DISPLAY & AFFORDABILITY UPDATES
// ============================================================================
function updateDisplays() {
  userCoins = parseInt(localStorage.getItem('task_game_coins') || localStorage.getItem('user_coins') || '0', 10);
  userStars = parseInt(localStorage.getItem('task_game_stars') || localStorage.getItem('user_stars') || '0', 10);
  userTickets = parseInt(localStorage.getItem('task_user_tickets') || localStorage.getItem('user_tickets') || localStorage.getItem('task_game_tickets') || '0', 10);

  const displayCoins = document.getElementById('shopCoinsDisplay');
  if (displayCoins) displayCoins.textContent = userCoins.toLocaleString();

  const topCoins = document.getElementById('shopCoinsDisplayTop');
  if (topCoins) topCoins.textContent = userCoins.toLocaleString();

  const displayStars = document.getElementById('shopStarsDisplay');
  if (displayStars) displayStars.textContent = userStars.toLocaleString();

  const topStars = document.getElementById('shopStarsDisplayTop');
  if (topStars) topStars.textContent = userStars.toLocaleString();

  const displayTickets = document.getElementById('shopTicketsDisplay');
  if (displayTickets) displayTickets.textContent = userTickets.toLocaleString();

  const avatarEl = typeof document.querySelector === 'function' ? document.querySelector('.user-avatar') : null;
  if (avatarEl) avatarEl.textContent = localStorage.getItem('player_avatar') || '🛍️';

  const nameEl = typeof document.querySelector === 'function' ? document.querySelector('.user-name') : null;
  if (nameEl) nameEl.textContent = localStorage.getItem('player_username') || 'Player';

  updateShopButtonAffordability();
  updateShopTimers();
}
window.updateDisplays = updateDisplays;

function updateShopButtonAffordability() {
  const currentCoins = parseInt(localStorage.getItem('task_game_coins') || localStorage.getItem('user_coins') || '0', 10) || 0;
  const currentStars = parseInt(localStorage.getItem('task_game_stars') || localStorage.getItem('user_stars') || '0', 10) || 0;
  const currentTickets = parseInt(localStorage.getItem('task_user_tickets') || localStorage.getItem('user_tickets') || localStorage.getItem('task_game_tickets') || '0', 10) || 0;

  Object.entries(SHOP_ITEMS).forEach(([itemId, meta]) => {
    const btn = document.getElementById(meta.btnId);
    if (!btn) return;
    if (btn.classList.contains('btn-disabled-cooldown')) {
      btn.classList.remove('btn-affordable');
      return;
    }

    let isAffordable = false;
    if (meta.costCoins > 0) {
      isAffordable = (currentCoins >= meta.costCoins);
    } else if (meta.costStars > 0) {
      isAffordable = (currentStars >= meta.costStars);
    } else if (meta.costTickets > 0) {
      isAffordable = (currentTickets >= meta.costTickets);
    } else {
      isAffordable = true;
    }

    if (isAffordable) {
      btn.classList.add('btn-affordable');
    } else {
      btn.classList.remove('btn-affordable');
    }
  });
}
window.updateShopButtonAffordability = updateShopButtonAffordability;

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================
let shopToastTimer = null;
function showShopToast(msg, type = 'info') {
  const toast = document.getElementById('shopToast');
  const text = document.getElementById('shopToastMsg');
  if (!toast || !text) return;
  text.textContent = msg;
  toast.style.display = 'flex';
  toast.style.position = 'fixed';
  toast.style.bottom = '85px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.zIndex = '9999';
  toast.style.padding = '10px 18px';
  toast.style.borderRadius = '999px';
  toast.style.fontSize = '0.85rem';
  toast.style.fontWeight = '700';
  toast.style.backdropFilter = 'blur(12px)';
  toast.style.boxShadow = '0 8px 24px rgba(0,0,0,0.6)';

  if (type === 'error') {
    toast.style.background = 'rgba(239, 68, 68, 0.95)';
    toast.style.border = '1.5px solid #f87171';
    toast.style.color = '#ffffff';
  } else if (type === 'success') {
    toast.style.background = 'rgba(16, 185, 129, 0.95)';
    toast.style.border = '1.5px solid #34d399';
    toast.style.color = '#ffffff';
  } else {
    toast.style.background = 'rgba(15, 23, 42, 0.95)';
    toast.style.border = '1.5px solid #38bdf8';
    toast.style.color = '#38bdf8';
  }

  clearTimeout(shopToastTimer);
  shopToastTimer = setTimeout(() => {
    toast.style.display = 'none';
  }, 3500);
}
window.showShopToast = showShopToast;

// ============================================================================
// SAFE CROSS-APPLICATION BALANCE SYNCHRONIZATION
// Preserves other balances when updating a specific currency
// ============================================================================
function syncAllBalances(coins, stars, tickets) {
  const currentCoins = parseInt(localStorage.getItem('task_game_coins') || localStorage.getItem('user_coins') || localStorage.getItem('task_game_coins_alt') || '0', 10) || 0;
  const currentStars = parseInt(localStorage.getItem('task_game_stars') || localStorage.getItem('user_stars') || '0', 10) || 0;
  const currentTickets = parseInt(localStorage.getItem('task_user_tickets') || localStorage.getItem('user_tickets') || localStorage.getItem('task_game_tickets') || '0', 10) || 0;

  const finalCoins = (typeof coins === 'number' && !isNaN(coins)) ? coins : currentCoins;
  const finalStars = (typeof stars === 'number' && !isNaN(stars)) ? stars : currentStars;
  const finalTickets = (typeof tickets === 'number' && !isNaN(tickets)) ? tickets : currentTickets;

  userCoins = finalCoins;
  userStars = finalStars;
  userTickets = finalTickets;

  localStorage.setItem('task_game_coins', finalCoins.toString());
  localStorage.setItem('user_coins', finalCoins.toString());
  localStorage.setItem('task_game_coins_alt', finalCoins.toString());

  localStorage.setItem('task_game_stars', finalStars.toString());
  localStorage.setItem('user_stars', finalStars.toString());

  localStorage.setItem('task_user_tickets', finalTickets.toString());
  localStorage.setItem('user_tickets', finalTickets.toString());
  localStorage.setItem('task_game_tickets', finalTickets.toString());

  updateDisplays();

  if (typeof window.updateAllDomBalances === 'function') {
    window.updateAllDomBalances(finalCoins, finalStars, finalTickets);
  }
  if (typeof updateDailyStreakHeaderDisplays === 'function') {
    updateDailyStreakHeaderDisplays();
  }

  try {
    const syncChannel = new BroadcastChannel('nova_task_sync');
    syncChannel.postMessage({ type: 'BALANCES_UPDATED', coins: finalCoins, stars: finalStars, tickets: finalTickets, timestamp: Date.now() });
    syncChannel.close();
  } catch (e) {}

  try {
    const ch = new BroadcastChannel('task_sync_channel');
    ch.postMessage({ type: 'BALANCES_UPDATED', coins: finalCoins, stars: finalStars, tickets: finalTickets, timestamp: Date.now() });
    ch.close();
  } catch (e) {}

  try {
    const bSync = new BroadcastChannel('balance_sync_channel');
    bSync.postMessage({ type: 'BALANCE_UPDATED', coins: finalCoins, stars: finalStars, tickets: finalTickets, timestamp: Date.now() });
    bSync.close();
  } catch (e) {}

  try {
    if (typeof CustomEvent === 'function') {
      window.dispatchEvent(new CustomEvent('balance:changed', {
        detail: { coins: finalCoins, stars: finalStars, tickets: finalTickets }
      }));
    } else if (typeof Event === 'function') {
      window.dispatchEvent(new Event('balance:changed'));
    }
  } catch (e) {}
}
window.syncAllBalances = syncAllBalances;

// ============================================================================
// WATCH ADS REWARDS: Free Coins (+100 🪙 ONLY) & Free Tickets (+1 🎟️ ONLY)
// ============================================================================
let isShopAdRunning = false;

function openAndPlayShopAd(rewardType, rewardAmount, itemId) {
  if (isShopAdRunning) return;
  const remaining = getItemUnlockRemaining(itemId);
  if (remaining > 0) {
    showShopToast(`⏱️ Item unlocked in ${formatRemainingTime(remaining)}`, 'info');
    return;
  }

  isShopAdRunning = true;

  // Temporarily disable the clicked button to avoid duplicate triggers
  const itemMeta = SHOP_ITEMS[itemId];
  if (itemMeta && itemMeta.btnId) {
    const btn = document.getElementById(itemMeta.btnId);
    if (btn) btn.disabled = true;
  }

  const modal = document.getElementById('shopAdModal');
  const timerText = document.getElementById('shopAdTimerText');
  if (modal) modal.style.display = 'flex';

  let countdown = 5;
  if (timerText) timerText.textContent = `Playing Ad... ${countdown}s`;

  // Open direct sponsor ad link for free reward claims
  if (typeof openSponsorAdLink === 'function') {
    openSponsorAdLink(itemId === 'ad_coins' ? 1 : 2);
  } else if (typeof window.openSponsorAdLink === 'function') {
    window.openSponsorAdLink(itemId === 'ad_coins' ? 1 : 2);
  }

  // Run Monetag / Rewarded Ad in parallel
  const adPromise = (typeof window.runRewardedAd === 'function')
    ? window.runRewardedAd()
    : (typeof window.show_11677609 === 'function' ? window.show_11677609() : Promise.resolve({ success: true }));

  let claimed = false;
  const finishAd = () => {
    if (claimed) return;
    claimed = true;
    if (modal) modal.style.display = 'none';
    isShopAdRunning = false;
    claimAdReward(rewardType, rewardAmount, itemId);
  };

  const interval = setInterval(() => {
    countdown--;
    if (timerText) timerText.textContent = `Playing Ad... ${countdown}s`;
    if (countdown <= 0) {
      clearInterval(interval);
      Promise.resolve(adPromise).catch(() => {}).then(() => {
        finishAd();
      });
    }
  }, 1000);
}

function claimAdReward(rewardType, rewardAmount, itemId) {
  if (rewardType === 'coins') {
    // Free coin reward adds strictly 100 coins
    const exactCoinsReward = 100;
    const currentCoins = parseInt(localStorage.getItem('task_game_coins') || localStorage.getItem('user_coins') || localStorage.getItem('task_game_coins_alt') || '0', 10) || 0;
    const newCoins = currentCoins + exactCoinsReward;

    localStorage.setItem('task_game_coins', newCoins.toString());
    localStorage.setItem('user_coins', newCoins.toString());
    localStorage.setItem('task_game_coins_alt', newCoins.toString());

    if (window.firebaseSync && typeof window.firebaseSync.setCoins === 'function') {
      window.firebaseSync.setCoins(newCoins);
    }

    startItemUnlock(itemId, SHOP_UNLOCK_DURATION_MS);
    shopSfx.playCoin();
    syncAllBalances(newCoins, undefined, undefined);

    alert(`🎉 Free Coins Claimed!\n\nYou watched the ad and claimed +100 Coins 🪙!\n\n• New Coin Balance: ${newCoins.toLocaleString()} 🪙\n• Cooldown: Item unlocks in 1 hour`);
    showShopToast(`🎉 +100 Free Coins added!`, 'success');
  } else if (rewardType === 'tickets') {
    // Free ticket reward adds strictly 1 ticket
    const exactTicketsReward = 1;
    const currentTickets = parseInt(localStorage.getItem('task_user_tickets') || localStorage.getItem('user_tickets') || localStorage.getItem('task_game_tickets') || '0', 10) || 0;
    const newTickets = currentTickets + exactTicketsReward;

    localStorage.setItem('task_user_tickets', newTickets.toString());
    localStorage.setItem('user_tickets', newTickets.toString());
    localStorage.setItem('task_game_tickets', newTickets.toString());

    if (window.firebaseSync && typeof window.firebaseSync.setTickets === 'function') {
      window.firebaseSync.setTickets(newTickets);
    }

    startItemUnlock(itemId, SHOP_UNLOCK_DURATION_MS);
    shopSfx.playPurchase();
    syncAllBalances(undefined, undefined, newTickets);

    alert(`🎉 Free Ticket Claimed!\n\nYou watched the ad and claimed +1 Ticket 🎟️!\n\n• New Ticket Balance: ${newTickets.toLocaleString()} 🎟️\n• Cooldown: Item unlocks in 1 hour`);
    showShopToast(`🎉 +1 Free Ticket added!`, 'success');
  }
}

function watchAdForCoins(btn) {
  openAndPlayShopAd('coins', 100, 'ad_coins');
}
window.watchAdForCoins = watchAdForCoins;

function watchAdForTickets(btn) {
  openAndPlayShopAd('tickets', 1, 'ad_tickets');
}
window.watchAdForTickets = watchAdForTickets;

// ============================================================================
// BUY STARS WITH COINS (3,000, 6,000, 30,000 Stars for 50, 100, 500 Coins)
// Deducts from Coin balance with confirmation, error state, and 5-hour cooldown
// ============================================================================
function buyStarsWithCoins(starAmount, coinCost, itemId = 'star_pack_' + (coinCost || starAmount)) {
  // Normalize arguments if needed (e.g. 50 Stars for 3,000 Coins)
  if (starAmount > coinCost && (coinCost === 50 || coinCost === 100 || coinCost === 500)) {
    const temp = starAmount;
    starAmount = coinCost;
    coinCost = temp;
  }
  const remaining = getItemUnlockRemaining(itemId);
  if (remaining > 0) {
    showShopToast(`⏱️ Item on cooldown! Unlocks in ${formatRemainingTime(remaining)}`, 'info');
    alert(`⏱️ Item is currently locked!\n\nThis pack is on a 5-hour cooldown.\nTime remaining: ${formatRemainingTime(remaining)}`);
    return false;
  }

  const currentCoins = parseInt(localStorage.getItem('task_game_coins') || localStorage.getItem('user_coins') || localStorage.getItem('task_game_coins_alt') || '0', 10) || 0;

  // 1. Check for insufficient Coins with clear error state
  if (currentCoins < coinCost) {
    const diff = coinCost - currentCoins;
    const errorMsg = `❌ Insufficient Coins!\n\nYou currently have ${currentCoins.toLocaleString()} 🪙 Coins, but need ${coinCost.toLocaleString()} 🪙 Coins (${diff.toLocaleString()} more).\n\nComplete tasks to earn more coins!`;
    alert(errorMsg);
    showShopToast(`❌ Insufficient Coins! Need ${diff.toLocaleString()} more 🪙`, 'error');
    return false;
  }

  // 2. Show confirmation message before deducting Coins
  const confirmed = confirm(`⭐ Purchase Confirmation:\n\nAre you sure you want to spend ${coinCost.toLocaleString()} 🪙 Coins to receive ${starAmount.toLocaleString()} ⭐ Stars?\n\n• Coin Cost: -${coinCost.toLocaleString()} 🪙\n• Stars Gained: +${starAmount.toLocaleString()} ⭐\n• Remaining Coins: ${(currentCoins - coinCost).toLocaleString()} 🪙`);
  if (!confirmed) {
    showShopToast('Purchase cancelled', 'info');
    return false;
  }

  try {
    // 3. Deduct coins
    const newCoins = currentCoins - coinCost;
    userCoins = newCoins;
    localStorage.setItem('task_game_coins', newCoins.toString());
    localStorage.setItem('user_coins', newCoins.toString());
    localStorage.setItem('task_game_coins_alt', newCoins.toString());
    if (window.firebaseSync && typeof window.firebaseSync.setCoins === 'function') {
      window.firebaseSync.setCoins(newCoins);
    }

    // 4. Add stars
    const currentStars = parseInt(localStorage.getItem('task_game_stars') || localStorage.getItem('user_stars') || '0', 10) || 0;
    const newStars = currentStars + starAmount;
    userStars = newStars;
    localStorage.setItem('task_game_stars', newStars.toString());
    localStorage.setItem('user_stars', newStars.toString());
    if (window.firebaseSync && typeof window.firebaseSync.setStars === 'function') {
      window.firebaseSync.setStars(newStars);
    }

    // 5. Start unlock cooldown
    startItemUnlock(itemId, SHOP_UNLOCK_DURATION_MS);

    // 6. Audio and UI feedback
    shopSfx.playPurchase();
    syncAllBalances(newCoins, newStars, undefined);

    alert(`🎉 Purchase Successful!\n\nYou bought ${starAmount.toLocaleString()} ⭐ Stars for ${coinCost.toLocaleString()} 🪙 Coins!\n\n• New Star Balance: ${newStars.toLocaleString()} ⭐\n• Remaining Coins: ${newCoins.toLocaleString()} 🪙\n• 5-Hour Unlock Cooldown Started`);
    showShopToast(`🎉 +${starAmount.toLocaleString()} ⭐ Stars added!`, 'success');
    return true;
  } catch (error) {
    console.error('Star purchase failed:', error);
    alert(`⚠️ Purchase Failed!\n\nAn unexpected error occurred: ${error.message || 'Transaction could not be completed'}.\n\nPlease try again.`);
    showShopToast('⚠️ Purchase failed. Please try again.', 'error');
    return false;
  }
}
window.buyStarsWithCoins = buyStarsWithCoins;

// ============================================================================
// BUY COINS WITH STARS (3,000, 6,000, 30,000 Coins)
// Deducts from Star balance with confirmation, error state, and 5-hour cooldown
// ============================================================================
function buyCoinsWithStars(coinAmount, starCost, itemId = 'coin_pack_' + starCost) {
  const remaining = getItemUnlockRemaining(itemId);
  if (remaining > 0) {
    showShopToast(`⏱️ Item on cooldown! Unlocks in ${formatRemainingTime(remaining)}`, 'info');
    alert(`⏱️ Item is currently locked!\n\nThis pack is on a 5-hour cooldown.\nTime remaining: ${formatRemainingTime(remaining)}`);
    return false;
  }

  const currentStars = parseInt(localStorage.getItem('task_game_stars') || localStorage.getItem('user_stars') || '0', 10) || 0;

  // 1. Check for insufficient Stars with clear error state
  if (currentStars < starCost) {
    const diff = starCost - currentStars;
    const errorMsg = `❌ Insufficient Stars!\n\nYou currently have ${currentStars.toLocaleString()} ⭐ Stars, but need ${starCost.toLocaleString()} ⭐ Stars (${diff.toLocaleString()} more).\n\nTop up your Telegram Stars or earn them from missions to buy coins!`;
    alert(errorMsg);
    showShopToast(`❌ Insufficient Stars! Need ${diff.toLocaleString()} more ⭐`, 'error');
    return false;
  }

  // 2. Show confirmation message before deducting Stars
  const confirmed = confirm(`⭐ Purchase Confirmation:\n\nAre you sure you want to spend ${starCost.toLocaleString()} ⭐ Stars to receive ${coinAmount.toLocaleString()} 🪙 Coins?\n\n• Star Cost: -${starCost.toLocaleString()} ⭐\n• Coins Gained: +${coinAmount.toLocaleString()} 🪙\n• Remaining Stars: ${(currentStars - starCost).toLocaleString()} ⭐`);
  if (!confirmed) {
    showShopToast('Purchase cancelled', 'info');
    return false;
  }

  try {
    // 3. Deduct stars
    const newStars = currentStars - starCost;
    userStars = newStars;
    localStorage.setItem('task_game_stars', newStars.toString());
    localStorage.setItem('user_stars', newStars.toString());
    if (window.firebaseSync && typeof window.firebaseSync.setStars === 'function') {
      window.firebaseSync.setStars(newStars);
    }

    // 4. Add coins
    const currentCoins = parseInt(localStorage.getItem('task_game_coins') || localStorage.getItem('user_coins') || localStorage.getItem('task_game_coins_alt') || '0', 10) || 0;
    const newCoins = currentCoins + coinAmount;
    userCoins = newCoins;
    localStorage.setItem('task_game_coins', newCoins.toString());
    localStorage.setItem('user_coins', newCoins.toString());
    localStorage.setItem('task_game_coins_alt', newCoins.toString());
    if (window.firebaseSync && typeof window.firebaseSync.setCoins === 'function') {
      window.firebaseSync.setCoins(newCoins);
    }

    // 5. Start 5-hour unlock cooldown
    startItemUnlock(itemId, SHOP_UNLOCK_DURATION_MS);

    // 6. Audio and UI feedback
    shopSfx.playPurchase();
    syncAllBalances(newCoins, newStars, undefined);

    alert(`🎉 Purchase Successful!\n\nYou bought ${coinAmount.toLocaleString()} 🪙 Coins for ${starCost.toLocaleString()} ⭐ Stars!\n\n• New Coin Balance: ${newCoins.toLocaleString()} 🪙\n• Remaining Stars: ${newStars.toLocaleString()} ⭐\n• 5-Hour Unlock Cooldown Started`);
    showShopToast(`🎉 +${coinAmount.toLocaleString()} 🪙 Coins added!`, 'success');
    return true;
  } catch (error) {
    console.error('Coin purchase failed:', error);
    alert(`⚠️ Purchase Failed!\n\nAn unexpected error occurred: ${error.message || 'Transaction could not be completed'}.\n\nPlease try again.`);
    showShopToast('⚠️ Purchase failed. Please try again.', 'error');
    return false;
  }
}
window.buyCoinsWithStars = buyCoinsWithStars;

// ============================================================================
// BUY TICKETS WITH STARS (100, 500, 1,000 Tickets)
// Deducts from Star balance with confirmation, error state, and 5-hour cooldown
// ============================================================================
function buyTicketsWithStars(ticketAmount, starCost, itemId = 'ticket_pack_' + ticketAmount) {
  const remaining = getItemUnlockRemaining(itemId);
  if (remaining > 0) {
    showShopToast(`⏱️ Item on cooldown! Unlocks in ${formatRemainingTime(remaining)}`, 'info');
    alert(`⏱️ Item is currently locked!\n\nThis pack is on a 5-hour cooldown.\nTime remaining: ${formatRemainingTime(remaining)}`);
    return false;
  }

  const currentStars = parseInt(localStorage.getItem('task_game_stars') || localStorage.getItem('user_stars') || '0', 10) || 0;

  // 1. Check for insufficient Stars with clear error state
  if (currentStars < starCost) {
    const diff = starCost - currentStars;
    const errorMsg = `❌ Insufficient Stars!\n\nYou currently have ${currentStars.toLocaleString()} ⭐ Stars, but need ${starCost.toLocaleString()} ⭐ Stars (${diff.toLocaleString()} more).\n\nTop up your Telegram Stars or earn them in missions to buy tickets!`;
    alert(errorMsg);
    showShopToast(`❌ Insufficient Stars! Need ${diff.toLocaleString()} more ⭐`, 'error');
    return false;
  }

  // 2. Show confirmation message before deducting Stars
  const confirmed = confirm(`⭐ Purchase Confirmation:\n\nAre you sure you want to spend ${starCost.toLocaleString()} ⭐ Stars to receive ${ticketAmount.toLocaleString()} 🎟️ Tickets?\n\n• Star Cost: -${starCost.toLocaleString()} ⭐\n• Tickets Gained: +${ticketAmount.toLocaleString()} 🎟️\n• Remaining Stars: ${(currentStars - starCost).toLocaleString()} ⭐`);
  if (!confirmed) {
    showShopToast('Purchase cancelled', 'info');
    return false;
  }

  try {
    // 3. Deduct stars
    const newStars = currentStars - starCost;
    userStars = newStars;
    localStorage.setItem('task_game_stars', newStars.toString());
    localStorage.setItem('user_stars', newStars.toString());
    if (window.firebaseSync && typeof window.firebaseSync.setStars === 'function') {
      window.firebaseSync.setStars(newStars);
    }

    // 4. Add tickets
    const currentTickets = parseInt(localStorage.getItem('task_user_tickets') || localStorage.getItem('user_tickets') || localStorage.getItem('task_game_tickets') || '0', 10) || 0;
    const newTickets = currentTickets + ticketAmount;
    userTickets = newTickets;
    localStorage.setItem('task_user_tickets', newTickets.toString());
    localStorage.setItem('user_tickets', newTickets.toString());
    localStorage.setItem('task_game_tickets', newTickets.toString());
    if (window.firebaseSync && typeof window.firebaseSync.setTickets === 'function') {
      window.firebaseSync.setTickets(newTickets);
    }

    // 5. Start 5-hour unlock cooldown
    startItemUnlock(itemId, SHOP_UNLOCK_DURATION_MS);

    // 6. Audio and UI feedback
    shopSfx.playPurchase();
    syncAllBalances(undefined, newStars, newTickets);

    alert(`🎉 Purchase Successful!\n\nYou bought ${ticketAmount.toLocaleString()} 🎟️ Tickets for ${starCost.toLocaleString()} ⭐ Stars!\n\n• New Ticket Balance: ${newTickets.toLocaleString()} 🎟️\n• Remaining Stars: ${newStars.toLocaleString()} ⭐\n• 5-Hour Unlock Cooldown Started`);
    showShopToast(`🎉 +${ticketAmount.toLocaleString()} 🎟️ Tickets added!`, 'success');
    return true;
  } catch (error) {
    console.error('Ticket purchase failed:', error);
    alert(`⚠️ Purchase Failed!\n\nAn unexpected error occurred: ${error.message || 'Transaction could not be completed'}.\n\nPlease try again.`);
    showShopToast('⚠️ Purchase failed. Please try again.', 'error');
    return false;
  }
}
window.buyTicketsWithStars = buyTicketsWithStars;

// Backward-compatible buyStars fallback
function buyStars(starAmount, coinCost) {
  return buyCoinsWithStars(coinCost, starAmount, 'star_' + starAmount);
}
window.buyStars = buyStars;

// Backward-compatible buyItem fallback
function buyItem(btn, price, itemName) {
  let coins = parseInt(localStorage.getItem('task_game_coins') || localStorage.getItem('user_coins') || '0', 10) || 0;
  if (coins < price) {
    alert(`Insufficient coins! You need ${price} 🪙 to purchase ${itemName}.`);
    return;
  }
  coins -= price;
  userCoins = coins;
  syncAllBalances(coins, undefined, undefined);
  shopSfx.playCoin();
  if (btn) {
    btn.textContent = 'Owned ✓';
    btn.disabled = true;
  }
  alert(`🎉 Purchase Successful!\n\nYou acquired: ${itemName}\nCoins remaining: ${coins.toLocaleString()} 🪙`);
}
window.buyItem = buyItem;

// ============================================================================
// INITIALIZATION & REAL-TIME LISTENERS
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  if (typeof autoLoginWithTelegram === 'function') autoLoginWithTelegram();
  updateDisplays();
  const savedTab = localStorage.getItem('task_game_shop_active_tab') || 'all';
  switchShopTab(savedTab);
});

// Storage events across browser tabs/windows
window.addEventListener('storage', (e) => {
  if (
    e.key === 'task_game_coins' ||
    e.key === 'user_coins' ||
    e.key === 'task_game_coins_alt' ||
    e.key === 'task_game_stars' ||
    e.key === 'user_stars' ||
    e.key === 'task_user_tickets' ||
    e.key === 'user_tickets' ||
    e.key === 'task_game_tickets' ||
    e.key === SHOP_UNLOCK_STORAGE_KEY
  ) {
    updateDisplays();
  }
});

// BroadcastChannels
try {
  const syncChannel = new BroadcastChannel('nova_task_sync');
  syncChannel.onmessage = () => {
    updateDisplays();
  };
} catch (e) {}

try {
  const bSync = new BroadcastChannel('balance_sync_channel');
  bSync.onmessage = () => {
    updateDisplays();
  };
} catch (e) {}

window.addEventListener('balance:changed', () => {
  updateDisplays();
});

window.addEventListener('balance:synced', () => {
  updateDisplays();
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    updateDisplays();
  }
});
