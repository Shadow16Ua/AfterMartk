const {createClient} = supabase;
const supabaseUrl = "https://akpszledxsrioqipmqzx.supabase.co";
const supabaseKey = "sb_publishable_tSt9Vn1aL91UKVRnpsnXOQ_GBKG9HiE";
const _supabase = createClient(supabaseUrl, supabaseKey);
const SHARED = {async getCurrentUser() {
  const {data: {session}} = await _supabase.auth.getSession();
  return session ? session.user.id : null;
}, 
// 1. Normal registration
    async signUp(email, password, username) {
        const { data, error } = await _supabase.auth.signUp({
            email: email, // Explicitly pass value
            password: password
        });
        if (error) throw error;

        if (data.user) {
            await _supabase.from("profiles").insert([{
                id: data.user.id,
                username: username || "Player",
                balance: 0
            }]);
        }
        return data;
    },

    async logIn(email, password) {
        const { data, error } = await _supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        if (error) throw error;
        return data;
    },
async logOut() {
  await _supabase.auth.signOut();
  location.reload();
}, 
async resetPassword(email) {
    const { error } = await _supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/profile.html', // Redirect user to profile after clicking the link
    });
    if (error) throw error;
},
// Change password for authenticated user
async updatePassword(newPassword) {
    const { error } = await _supabase.auth.updateUser({
        password: newPassword
    });
    if (error) throw error;
},

async getBalance() {
  const _0x41b3xd = await this.getCurrentUser();
  if (!_0x41b3xd) {
    return 0;
  }
  ;
  const {data} = await _supabase.from("profiles").select("balance").eq("id", _0x41b3xd).maybeSingle();
  return data ? data.balance : 0;
}, async setBalance(_0x41b3xf) {
  const _0x41b3xd = await this.getCurrentUser();
  if (!_0x41b3xd) {
    return;
  }
  ;
  await _supabase.from("profiles").update({balance: _0x41b3xf}).eq("id", _0x41b3xd);
  await this.updateHeaderBalance();
}, async getProfile() {
  const _0x41b3xd = await this.getCurrentUser();
  if (!_0x41b3xd) {
    return null;
  }
  ;
  const {data} = await _supabase.from("profiles").select("*").eq("id", _0x41b3xd).maybeSingle();
  return data;
}, async getEvents() {
  const {data, error} = await _supabase.from("events").select("*").order("id", {ascending: false});
  if (error) {
    return [];
  }
  ;
  return data || [];
}, async addEvent(_0x41b3x13) {
  const {id, ...newEvent} = _0x41b3x13;
  await _supabase.from("events").insert([newEvent]);
}, async deleteEvent(_0x41b3x15) {
  const _0x41b3x16 = parseInt(_0x41b3x15);
  await _supabase.from("bets").delete().eq("event_id", _0x41b3x16);
  await _supabase.from("events").delete().eq("id", _0x41b3x16);
}, async addBet(_0x41b3x18) {
  const _0x41b3xd = await this.getCurrentUser();
  const _0x41b3x19 = parseInt(_0x41b3x18.eventId);
  const _0x41b3x1a = parseInt(_0x41b3x18.amount);
  const _0x41b3x1b = {user_id: _0x41b3xd, event_id: _0x41b3x19, title: _0x41b3x18.title, outcome: _0x41b3x18.outcome.trim(), amount: _0x41b3x1a, pct: parseInt(_0x41b3x18.pct), status: "active", deadline: _0x41b3x18.deadline, created_at: new Date};
  const {error} = await _supabase.from("bets").insert([_0x41b3x1b]);
  if (error) {
    throw error;
  }
  ;
  const {data: allBets} = await _supabase.from("bets").select("outcome, amount, user_id").eq("event_id", _0x41b3x19);
  const {data: ev} = await _supabase.from("events").select("*").eq("id", _0x41b3x19).single();
  if (ev && allBets) {
    const _0x41b3x1c = 100;
    let _0x41b3x1d = 0;
    const _0x41b3x1e = new Set(allBets.map(_0x41b3x1f => {
      return _0x41b3x1f.user_id;
    })).size;
    if (ev.type === "yesno") {
      let _0x41b3x20 = _0x41b3x1c;
      let _0x41b3x21 = _0x41b3x1c;
      for (let _0x41b3x1f of allBets) {
        if (_0x41b3x1f.outcome === "Yes") {
          _0x41b3x20 += _0x41b3x1f.amount;
        }
        ;
        if (_0x41b3x1f.outcome === "No") {
          _0x41b3x21 += _0x41b3x1f.amount;
        }
        ;
        _0x41b3x1d += _0x41b3x1f.amount;
      }
      ;
      const _0x41b3x22 = _0x41b3x20 + _0x41b3x21;
      const _0x41b3x23 = Math.round(_0x41b3x20 / _0x41b3x22 * 100);
      const _0x41b3x24 = 100 - _0x41b3x23;
      await _supabase.from("events").update({volume: _0x41b3x1d, players: _0x41b3x1e, yes: _0x41b3x23, no: _0x41b3x24}).eq("id", _0x41b3x19);
    } else {
      let _0x41b3x25 = ev.options || [];
      let _0x41b3x26 = {};
      _0x41b3x25.forEach(_0x41b3x27 => {
        return _0x41b3x26[_0x41b3x27.label] = _0x41b3x1c;
      });
      for (let _0x41b3x1f of allBets) {
        if (_0x41b3x26[_0x41b3x1f.outcome] !== undefined) {
          _0x41b3x26[_0x41b3x1f.outcome] += _0x41b3x1f.amount;
        }
        ;
        _0x41b3x1d += _0x41b3x1f.amount;
      }
      ;
      let _0x41b3x22 = Object.values(_0x41b3x26).reduce((_0x41b3x28, _0x41b3x1f) => {
        return _0x41b3x28 + _0x41b3x1f;
      }, 0);
      let _0x41b3x29 = _0x41b3x25.map(_0x41b3x27 => {
        return {label: _0x41b3x27.label, pct: Math.round(_0x41b3x26[_0x41b3x27.label] / _0x41b3x22 * 100)};
      });
      let _0x41b3x2a = _0x41b3x29.reduce((_0x41b3x28, _0x41b3x1f) => {
        return _0x41b3x28 + _0x41b3x1f.pct;
      }, 0);
      if (_0x41b3x2a !== 100 && _0x41b3x29.length > 0) {
        _0x41b3x29[0].pct += 100 - _0x41b3x2a;
      }
      ;
      await _supabase.from("events").update({volume: _0x41b3x1d, players: _0x41b3x1e, options: _0x41b3x29}).eq("id", _0x41b3x19);
    }
  }
}, async getBets() {
  const _0x41b3xd = await this.getCurrentUser();
  const {data} = await _supabase.from("bets").select("*").eq("user_id", _0x41b3xd).order("id", {ascending: false});
  return data || [];
}, async resolveEvent(_0x41b3x15, _0x41b3x2d) {
  console.log("1. Starting payouts. Event ID:", _0x41b3x15, "Winner:", _0x41b3x2d);
  const _0x41b3x16 = parseInt(_0x41b3x15);
  const _0x41b3x2e = String(_0x41b3x2d).trim();
  try {
    console.log("2. Updating event status...");
    const {error: evErr} = await _supabase.from("events").update({status: "finished", winner: _0x41b3x2e}).eq("id", _0x41b3x16);
    if (evErr) {
      throw evErr;
    }
    ;
    console.log("3. Looking for bets for event #", _0x41b3x16);
    const {data: bets, error: betErr} = await _supabase.from("bets").select("*").eq("event_id", _0x41b3x16).eq("status", "active");
    if (betErr) {
      throw betErr;
    }
    ;
    if (!bets || bets.length === 0) {
      console.log("4. No active bets, finishing.");
      return true;
    }
    ;
    console.log("5. Found " + bets.length + " bets. Updating...");
    for (let _0x41b3x18 of bets) {
      const _0x41b3x2f = _0x41b3x18.outcome ? String(_0x41b3x18.outcome).trim() : "";
      const _0x41b3x30 = _0x41b3x2f === _0x41b3x2e;
      const _0x41b3x31 = _0x41b3x30 ? "won" : "lost";
      console.log("-> Bet ID " + _0x41b3x18.id + ': Forecast "' + _0x41b3x2f + '" vs Result "' + _0x41b3x2e + '". Status: ' + _0x41b3x31 + "");
      if (_0x41b3x30) {
        const _0x41b3x32 = _0x41b3x18.pct && _0x41b3x18.pct > 0 ? _0x41b3x18.pct : 1;
        const _0x41b3x33 = Math.round(_0x41b3x18.amount * (100 / _0x41b3x32));
        console.log("   🏆 Win! Crediting ₡" + _0x41b3x33 + " to player " + _0x41b3x18.user_id + "");
        const {data: user} = await _supabase.from("profiles").select("balance").eq("id", _0x41b3x18.user_id).maybeSingle();
        if (user) {
          await _supabase.from("profiles").update({balance: user.balance + _0x41b3x33}).eq("id", _0x41b3x18.user_id);
        }
      }
      ;
      const {error: updErr} = await _supabase.from("bets").update({status: _0x41b3x31}).eq("id", _0x41b3x18.id);
      if (updErr) {
        console.error("   ❌ Error writing bet status:", updErr);
      }
    }
    ;
    console.log("6. All bets successfully updated!");
    await this.updateHeaderBalance();
    return true;
  } catch (e) {
    console.error("❌ CRITICAL ERROR in resolveEvent:", e);
    throw e;
  }
}, async updateHeaderBalance() {
  const _0x41b3x1f = await this.getBalance();
  const _0x41b3x35 = document.querySelectorAll("#bal-num, #bal-n, #p-bal");
  _0x41b3x35.forEach(_0x41b3x36 => {
    if (_0x41b3x36) {
      _0x41b3x36.textContent = _0x41b3x1f.toLocaleString();
    }
  });
}, 

async updateUsername(_0x41b3x38) {
  const {data: {user}} = await _supabase.auth.getUser();
  if (!user) {
    return;
  };
  
  const {error} = await _supabase.from("profiles").update({username: _0x41b3x38}).eq("id", user.id);
  if (error) {
    console.error("Error changing name:", error);
    throw error;
  }
},

async updateAvatar(newAvatar) {
      const { data: { session } } = await _supabase.auth.getSession();
      if (!session) return;
      
      const { error } = await _supabase.from("profiles").update({ avatar: newAvatar }).eq("id", session.user.id);
      if (error) {
          console.error("Error changing avatar:", error);
          throw error;
      }
  },
}



