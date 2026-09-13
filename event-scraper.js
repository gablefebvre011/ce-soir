#!/usr/bin/env node

/**
 * EVENT SCRAPER - Montréal Events
 * Scrape les événements GRATUITS depuis plusieurs sources
 * et injecte dans Supabase table `evenements`
 */

const https = require('https');
const http = require('http');
const { createClient } = require('@supabase/supabase-js');

// ===== CONFIG =====
const SUPABASE_URL = "https://xdqyciiydyrcihlawbew.supabase.co";
const SUPABASE_KEY = "sb_publishable_16T1u36mEqGc2efn9rk7Nw_d_cQ6LnI";

let supabase;

// ===== UTILS =====
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function normalizeEvent(event, source) {
  return {
    nom: event.nom || event.name || event.title || '?',
    description: event.description || event.desc || '',
    zone: event.zone || event.location || 'Montréal',
    categorie: event.categorie || event.category || 'Événement',
    date_debut: event.date_debut || event.date_start || new Date().toISOString(),
    date_fin: event.date_fin || event.date_end || new Date(Date.now() + 3*24*60*60*1000).toISOString(),
    gratuit: true,
    actif: true,
    isEvenement: true,
    source: source,
    url: event.url || '',
    latitude: event.latitude || event.lat || 45.5017,
    longitude: event.longitude || event.lng || -73.5673,
    created_at: new Date().toISOString()
  };
}

// ===== SCRAPERS =====

// 1. MEETUP.COM
async function scrapeMeetup() {
  console.log('🔍 Scraping Meetup.com...');
  const events = [];
  
  try {
    // Chercher les Meetup gratuits à Montréal (par recherche)
    const url = 'https://www.meetup.com/api/3/find/events?location=Montreal%2C%20QC&sign=true&photo-host=public&status=upcoming&format=json';
    const data = await httpGet(url);
    const json = JSON.parse(data);
    
    if(json.data) {
      json.data.slice(0, 20).forEach(event => {
        // Meetup ne montre que les gratuits par défaut
        events.push(normalizeEvent({
          nom: event.name,
          description: event.description,
          zone: event.group?.localized_location || 'Montréal',
          categorie: event.group?.category?.name || 'Meetup',
          date_debut: new Date(event.time).toISOString(),
          date_fin: new Date(event.time + (event.duration || 3600000)).toISOString(),
          url: event.link,
          latitude: event.venue?.lat || 45.5017,
          longitude: event.venue?.lon || -73.5673
        }, 'Meetup'));
      });
    }
  } catch(e) {
    console.warn('⚠️ Meetup error:', e.message);
  }
  
  return events;
}

// 2. EVENTBRITE FREE EVENTS
async function scrapeEventbrite() {
  console.log('🔍 Scraping Eventbrite (free)...');
  const events = [];
  
  try {
    // Eventbrite free events Montreal
    const url = 'https://www.eventbrite.ca/api/v3/searches/?q=montreal&price=free&sort_by=date&expand=organizer%2Cvenue';
    const data = await httpGet(url);
    const json = JSON.parse(data);
    
    if(json.events) {
      json.events.slice(0, 15).forEach(event => {
        if(!event.ticket_availability?.has_available_tickets) return;
        
        events.push(normalizeEvent({
          nom: event.name?.text || 'Événement',
          description: event.description?.text || '',
          zone: event.venue?.address?.city || 'Montréal',
          categorie: event.category?.name || 'Événement',
          date_debut: event.start?.utc || new Date().toISOString(),
          date_fin: event.end?.utc || new Date(Date.now() + 2*24*60*60*1000).toISOString(),
          url: event.url || ''
        }, 'Eventbrite'));
      });
    }
  } catch(e) {
    console.warn('⚠️ Eventbrite error:', e.message);
  }
  
  return events;
}

// 3. REDDIT r/Montreal
async function scrapeReddit() {
  console.log('🔍 Scraping Reddit r/Montreal...');
  const events = [];
  
  try {
    const url = 'https://reddit.com/r/Montreal/new.json?limit=50';
    const data = await httpGet(url);
    const json = JSON.parse(data);
    
    if(json.data?.children) {
      json.data.children.forEach(post => {
        const title = post.data.title;
        // Filtrer pour mentions d'événements gratuits
        if((title.includes('free') || title.includes('gratuit') || title.includes('event')) && !title.includes('$')) {
          events.push(normalizeEvent({
            nom: title.slice(0, 80),
            description: post.data.selftext.slice(0, 200),
            categorie: 'Communauté',
            zone: 'Montréal',
            url: `https://reddit.com${post.data.permalink}`
          }, 'Reddit'));
        }
      });
    }
  } catch(e) {
    console.warn('⚠️ Reddit error:', e.message);
  }
  
  return events;
}

// 4. VILLE DE MONTRÉAL (activités gratuites)
async function scrapeVilleMonutreal() {
  console.log('🔍 Scraping Ville de Montréal...');
  const events = [];
  
  try {
    // Loisirs gratuits Montréal
    const url = 'https://www.montreal.ca/sites/default/files/node/files/loisirs_jeunesse.json';
    const data = await httpGet(url);
    const json = JSON.parse(data);
    
    if(Array.isArray(json)) {
      json.slice(0, 25).forEach(activity => {
        events.push(normalizeEvent({
          nom: activity.nom || activity.name || 'Activité',
          description: activity.description || '',
          categorie: activity.type || 'Loisirs',
          zone: activity.arrondissement || 'Montréal',
          gratuit: true
        }, 'Ville de Montréal'));
      });
    }
  } catch(e) {
    console.warn('⚠️ Ville de Montréal error:', e.message);
  }
  
  return events;
}

// 5. BANQ (Événements culturels gratuits)
async function scrapeBanQ() {
  console.log('🔍 Scraping BAnQ...');
  const events = [];
  
  try {
    const url = 'https://www.banq.qc.ca/documents/json/programs_fr.json';
    const data = await httpGet(url);
    const json = JSON.parse(data);
    
    if(json.programs) {
      json.programs.slice(0, 20).forEach(prog => {
        if(prog.cost === 'Gratuit' || prog.cost === 'free') {
          events.push(normalizeEvent({
            nom: prog.title || prog.name || 'Activité BAnQ',
            description: prog.description || '',
            categorie: 'Culture',
            zone: prog.branch || 'Montréal',
            date_debut: prog.date_start || new Date().toISOString()
          }, 'BAnQ'));
        }
      });
    }
  } catch(e) {
    console.warn('⚠️ BAnQ error:', e.message);
  }
  
  return events;
}

// ===== MAIN =====
async function runScraper() {
  console.log('\n🚀 === EVENT SCRAPER STARTUP ===\n');
  
  // Init Supabase
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  try {
    // Scraper toutes les sources
    const [meetup, eventbrite, reddit, villeMonutreal, banq] = await Promise.all([
      scrapeMeetup(),
      scrapeEventbrite(),
      scrapeReddit(),
      scrapeVilleMonutreal(),
      scrapeBanQ()
    ]);
    
    const allEvents = [...meetup, ...eventbrite, ...reddit, ...villeMonutreal, ...banq];
    console.log(`\n✅ ${allEvents.length} événements trouvés\n`);
    
    if(allEvents.length === 0) {
      console.warn('⚠️ Aucun événement trouvé');
      return;
    }
    
    // Dédupliquer par nom + zone
    const seen = new Set();
    const deduped = [];
    allEvents.forEach(e => {
      const key = `${e.nom.toLowerCase()}|${e.zone.toLowerCase()}`;
      if(!seen.has(key)) {
        deduped.push(e);
        seen.add(key);
      }
    });
    
    console.log(`📊 Après dédup: ${deduped.length} événements uniques\n`);
    
    // Injecter en DB
    const { data, error } = await supabase
      .from('evenements')
      .upsert(deduped, { onConflict: 'nom,zone' });
    
    if(error) {
      console.error('❌ DB Error:', error);
    } else {
      console.log(`✅ ${deduped.length} événements injectés en DB`);
    }
    
  } catch(e) {
    console.error('❌ FATAL:', e.message);
  }
  
  console.log('\n⏰ Prochain scan: 4h\n');
}

// ===== AUTO-RUN =====
// Lancer immédiatement
runScraper();

// Puis chaque 4h
setInterval(runScraper, 4 * 60 * 60 * 1000);

// Pour tester rapidement: node event-scraper.js
