import Parser from 'rss-parser';
import { NewsArticle, NewsSource, RSSFeed } from '@/types';
import { extractKeywords, estimateReadTime, generateId, getFlagEmoji } from './utils';
import { globalCache, generateCacheKey } from './cache';

const rssParser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  },
  customFields: {
    item: [
      'media:content',
      'media:thumbnail',
      'enclosure',
      'content:encoded',
      'content',
      'summary',
      'author',
      'creator',
      'dc:creator',
      'dc:date',
      'published',
      'updated',
      'category',
      'categories',
    ],
  },
});

// Comprehensive Global RSS Feed Database
export const GLOBAL_RSS_FEEDS: RSSFeed[] = [
  // === ASIA ===
  // Japan
  { url: 'https://www.asahi.com/english/rss/', category: 'general', source: { id: 'asahi', name: 'Asahi Shimbun', url: 'https://www.asahi.com', category: 'general', language: 'en', country: 'jp' } },
  { url: 'https://english.kyodonews.net/rss/news.xml', category: 'general', source: { id: 'kyodo', name: 'Kyodo News', url: 'https://english.kyodonews.net', category: 'general', language: 'en', country: 'jp' } },
  { url: 'https://mainichi.jp/english/rss/', category: 'general', source: { id: 'mainichi', name: 'Mainichi Japan', url: 'https://mainichi.jp', category: 'general', language: 'en', country: 'jp' } },
  { url: 'https://www.japantimes.co.jp/feed/', category: 'general', source: { id: 'japan-times', name: 'Japan Times', url: 'https://www.japantimes.co.jp', category: 'general', language: 'en', country: 'jp' } },
  { url: 'https://www.nippon.com/en/rss/', category: 'general', source: { id: 'nippon', name: 'Nippon.com', url: 'https://www.nippon.com', category: 'general', language: 'en', country: 'jp' } },
  { url: 'https://news.yahoo.co.jp/rss/topics/top-picks.xml', category: 'general', source: { id: 'yahoo-jp', name: 'Yahoo Japan News', url: 'https://news.yahoo.co.jp', category: 'general', language: 'ja', country: 'jp' } },
  
  // India
  { url: 'https://www.thehindu.com/news/?service=rss', category: 'general', source: { id: 'hindu', name: 'The Hindu', url: 'https://www.thehindu.com', category: 'general', language: 'en', country: 'in' } },
  { url: 'https://timesofindia.indiatimes.com/rssfeeds/1898055.cms', category: 'general', source: { id: 'toi', name: 'Times of India', url: 'https://timesofindia.indiatimes.com', category: 'general', language: 'en', country: 'in' } },
  { url: 'https://www.indiatoday.in/rss', category: 'general', source: { id: 'india-today', name: 'India Today', url: 'https://www.indiatoday.in', category: 'general', language: 'en', country: 'in' } },
  { url: 'https://www.ndtv.com/rss', category: 'general', source: { id: 'ndtv', name: 'NDTV', url: 'https://www.ndtv.com', category: 'general', language: 'en', country: 'in' } },
  { url: 'https://indianexpress.com/feed/', category: 'general', source: { id: 'ie', name: 'Indian Express', url: 'https://indianexpress.com', category: 'general', language: 'en', country: 'in' } },
  { url: 'https://www.hindustantimes.com/rss', category: 'general', source: { id: 'ht', name: 'Hindustan Times', url: 'https://www.hindustantimes.com', category: 'general', language: 'en', country: 'in' } },
  { url: 'https://www.business-standard.com/rss/latest.rss', category: 'business', source: { id: 'bs', name: 'Business Standard', url: 'https://www.business-standard.com', category: 'business', language: 'en', country: 'in' } },
  { url: 'https://economictimes.indiatimes.com/rssfeedsdefault.cms', category: 'business', source: { id: 'et', name: 'Economic Times', url: 'https://economictimes.indiatimes.com', category: 'business', language: 'en', country: 'in' } },
  
  // China
  { url: 'https://www.scmp.com/rss/91/feed', category: 'general', source: { id: 'scmp', name: 'South China Morning Post', url: 'https://www.scmp.com', category: 'general', language: 'en', country: 'hk' } },
  { url: 'https://www.globaltimes.cn/rss/index.xml', category: 'general', source: { id: 'gt', name: 'Global Times', url: 'https://www.globaltimes.cn', category: 'general', language: 'en', country: 'cn' } },
  { url: 'https://www.chinadaily.com.cn/rss/world_rss.xml', category: 'general', source: { id: 'china-daily', name: 'China Daily', url: 'https://www.chinadaily.com.cn', category: 'general', language: 'en', country: 'cn' } },
  { url: 'https://www.cgtn.com/subscribe/rss', category: 'general', source: { id: 'cgtn', name: 'CGTN', url: 'https://www.cgtn.com', category: 'general', language: 'en', country: 'cn' } },
  
  // Southeast Asia
  { url: 'https://www.channelnewsasia.com/rssfeeds/8395986', category: 'general', source: { id: 'cna', name: 'Channel News Asia', url: 'https://www.channelnewsasia.com', category: 'general', language: 'en', country: 'sg' } },
  { url: 'https://www.straitstimes.com/news/singapore/rss.xml', category: 'general', source: { id: 'st', name: 'Straits Times', url: 'https://www.straitstimes.com', category: 'general', language: 'en', country: 'sg' } },
  { url: 'https://www.thejakartapost.com/rss', category: 'general', source: { id: 'jp', name: 'Jakarta Post', url: 'https://www.thejakartapost.com', category: 'general', language: 'en', country: 'id' } },
  { url: 'https://www.bangkokpost.com/rss/data/topstories.xml', category: 'general', source: { id: 'bp', name: 'Bangkok Post', url: 'https://www.bangkokpost.com', category: 'general', language: 'en', country: 'th' } },
  { url: 'https://www.manilatimes.net/feed/', category: 'general', source: { id: 'mt', name: 'Manila Times', url: 'https://www.manilatimes.net', category: 'general', language: 'en', country: 'ph' } },
  { url: 'https://mb.com.ph/rss', category: 'general', source: { id: 'mb', name: 'Manila Bulletin', url: 'https://mb.com.ph', category: 'general', language: 'en', country: 'ph' } },
  { url: 'https://www.vietnamnews.vn/rss', category: 'general', source: { id: 'vn', name: 'Vietnam News', url: 'https://www.vietnamnews.vn', category: 'general', language: 'en', country: 'vn' } },
  { url: 'https://www.nst.com.my/rss.xml', category: 'general', source: { id: 'nst', name: 'New Straits Times', url: 'https://www.nst.com.my', category: 'general', language: 'en', country: 'my' } },
  { url: 'https://www.thestar.com.my/rss', category: 'general', source: { id: 'star-my', name: 'The Star Malaysia', url: 'https://www.thestar.com.my', category: 'general', language: 'en', country: 'my' } },
  { url: 'https://www.khmertimeskh.com/feed/', category: 'general', source: { id: 'kt', name: 'Khmer Times', url: 'https://www.khmertimeskh.com', category: 'general', language: 'en', country: 'kh' } },
  { url: 'https://laotiantimes.com/feed/', category: 'general', source: { id: 'lt', name: 'Laotian Times', url: 'https://laotiantimes.com', category: 'general', language: 'en', country: 'la' } },
  { url: 'https://myanmar-now.org/en/feed/', category: 'general', source: { id: 'mn', name: 'Myanmar Now', url: 'https://myanmar-now.org', category: 'general', language: 'en', country: 'mm' } },
  
  // South Asia
  { url: 'https://www.dawn.com/feeds/home', category: 'general', source: { id: 'dawn', name: 'Dawn', url: 'https://www.dawn.com', category: 'general', language: 'en', country: 'pk' } },
  { url: 'https://tribune.com.pk/feed/', category: 'general', source: { id: 'etribune', name: 'Express Tribune', url: 'https://tribune.com.pk', category: 'general', language: 'en', country: 'pk' } },
  { url: 'https://www.thenews.com.pk/rss', category: 'general', source: { id: 'news-pk', name: 'The News', url: 'https://www.thenews.com.pk', category: 'general', language: 'en', country: 'pk' } },
  { url: 'https://www.thedailystar.net/rss.xml', category: 'general', source: { id: 'ds', name: 'Daily Star', url: 'https://www.thedailystar.net', category: 'general', language: 'en', country: 'bd' } },
  { url: 'https://www.dhakatribune.com/feed', category: 'general', source: { id: 'dt', name: 'Dhaka Tribune', url: 'https://www.dhakatribune.com', category: 'general', language: 'en', country: 'bd' } },
  { url: 'https://www.colombogazette.com/feed/', category: 'general', source: { id: 'cg', name: 'Colombo Gazette', url: 'https://www.colombogazette.com', category: 'general', language: 'en', country: 'lk' } },
  { url: 'https://kathmandupost.com/rss', category: 'general', source: { id: 'kp', name: 'Kathmandu Post', url: 'https://kathmandupost.com', category: 'general', language: 'en', country: 'np' } },
  { url: 'https://www.thehimalayan.net/feed/', category: 'general', source: { id: 'th', name: 'The Himalayan', url: 'https://www.thehimalayan.net', category: 'general', language: 'en', country: 'np' } },
  { url: 'https://kuenselonline.com/feed/', category: 'general', source: { id: 'kuensel', name: 'Kuensel', url: 'https://kuenselonline.com', category: 'general', language: 'en', country: 'bt' } },
  { url: 'https://www.maldivesindependent.com/feed/', category: 'general', source: { id: 'mi', name: 'Maldives Independent', url: 'https://www.maldivesindependent.com', category: 'general', language: 'en', country: 'mv' } },
  
  // East Asia
  { url: 'http://www.koreaherald.com/rss/05010000.xml', category: 'general', source: { id: 'kh', name: 'Korea Herald', url: 'http://www.koreaherald.com', category: 'general', language: 'en', country: 'kr' } },
  { url: 'http://www.koreatimes.co.kr/www/rss/nation.xml', category: 'general', source: { id: 'ktimes', name: 'Korea Times', url: 'http://www.koreatimes.co.kr', category: 'general', language: 'en', country: 'kr' } },
  { url: 'https://www.khan.co.kr/rss/rssdata/total_news.xml', category: 'general', source: { id: 'khan', name: 'Kyunghyang Shinmun', url: 'https://www.khan.co.kr', category: 'general', language: 'ko', country: 'kr' } },
  { url: 'https://www.taiwannews.com.tw/en/rss', category: 'general', source: { id: 'tn', name: 'Taiwan News', url: 'https://www.taiwannews.com.tw', category: 'general', language: 'en', country: 'tw' } },
  { url: 'https://www.taipeitimes.com/News/rss', category: 'general', source: { id: 'tpt', name: 'Taipei Times', url: 'https://www.taipeitimes.com', category: 'general', language: 'en', country: 'tw' } },
  { url: 'https://www.mongoliaweekly.org/feed/', category: 'general', source: { id: 'mw', name: 'Mongolia Weekly', url: 'https://www.mongoliaweekly.org', category: 'general', language: 'en', country: 'mn' } },
  
  // === EUROPE ===
  // UK & Ireland
  { url: 'http://feeds.bbci.co.uk/news/rss.xml', category: 'general', source: { id: 'bbc', name: 'BBC News', url: 'https://www.bbc.co.uk/news', category: 'general', language: 'en', country: 'gb' } },
  { url: 'https://www.theguardian.com/world/rss', category: 'general', source: { id: 'guardian', name: 'The Guardian', url: 'https://www.theguardian.com', category: 'general', language: 'en', country: 'gb' } },
  { url: 'https://www.independent.co.uk/rss', category: 'general', source: { id: 'independent', name: 'The Independent', url: 'https://www.independent.co.uk', category: 'general', language: 'en', country: 'gb' } },
  { url: 'https://www.telegraph.co.uk/rss.xml', category: 'general', source: { id: 'telegraph', name: 'The Telegraph', url: 'https://www.telegraph.co.uk', category: 'general', language: 'en', country: 'gb' } },
  { url: 'https://www.ft.com/?format=rss', category: 'business', source: { id: 'ft', name: 'Financial Times', url: 'https://www.ft.com', category: 'business', language: 'en', country: 'gb' } },
  { url: 'https://www.economist.com/latest/rss.xml', category: 'business', source: { id: 'economist', name: 'The Economist', url: 'https://www.economist.com', category: 'business', language: 'en', country: 'gb' } },
  { url: 'https://www.irishtimes.com/rss/news', category: 'general', source: { id: 'it', name: 'Irish Times', url: 'https://www.irishtimes.com', category: 'general', language: 'en', country: 'ie' } },
  { url: 'https://www.independent.ie/rss', category: 'general', source: { id: 'ii', name: 'Irish Independent', url: 'https://www.independent.ie', category: 'general', language: 'en', country: 'ie' } },
  
  // France
  { url: 'https://www.france24.com/en/rss', category: 'general', source: { id: 'f24', name: 'France 24', url: 'https://www.france24.com', category: 'general', language: 'en', country: 'fr' } },
  { url: 'https://www.thelocal.fr/feeds/rss.php', category: 'general', source: { id: 'local-fr', name: 'The Local France', url: 'https://www.thelocal.fr', category: 'general', language: 'en', country: 'fr' } },
  { url: 'https://www.connexionfrance.com/rss', category: 'general', source: { id: 'connexion', name: 'Connexion France', url: 'https://www.connexionfrance.com', category: 'general', language: 'en', country: 'fr' } },
  
  // Germany
  { url: 'https://www.spiegel.de/international/index.rss', category: 'general', source: { id: 'spiegel', name: 'Der Spiegel', url: 'https://www.spiegel.de', category: 'general', language: 'en', country: 'de' } },
  { url: 'https://rss.dw.com/rdf/rss-en-all', category: 'general', source: { id: 'dw', name: 'Deutsche Welle', url: 'https://www.dw.com', category: 'general', language: 'en', country: 'de' } },
  { url: 'https://www.thelocal.de/feeds/rss.php', category: 'general', source: { id: 'local-de', name: 'The Local Germany', url: 'https://www.thelocal.de', category: 'general', language: 'en', country: 'de' } },
  
  // Other Europe
  { url: 'https://www.politico.eu/feed/', category: 'politics', source: { id: 'politico', name: 'Politico EU', url: 'https://www.politico.eu', category: 'politics', language: 'en', country: 'eu' } },
  { url: 'https://www.euronews.com/rss', category: 'general', source: { id: 'euronews', name: 'Euronews', url: 'https://www.euronews.com', category: 'general', language: 'en', country: 'eu' } },
  { url: 'https://www.themoscowtimes.com/rss/news', category: 'general', source: { id: 'moscow-times', name: 'Moscow Times', url: 'https://www.themoscowtimes.com', category: 'general', language: 'en', country: 'ru' } },
  { url: 'https://www.rferl.org/api/', category: 'general', source: { id: 'rferl', name: 'Radio Free Europe', url: 'https://www.rferl.org', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://www.swissinfo.ch/eng/rss', category: 'general', source: { id: 'swissinfo', name: 'Swissinfo', url: 'https://www.swissinfo.ch', category: 'general', language: 'en', country: 'ch' } },
  { url: 'https://www.dutchnews.nl/feed/', category: 'general', source: { id: 'dutchnews', name: 'Dutch News', url: 'https://www.dutchnews.nl', category: 'general', language: 'en', country: 'nl' } },
  { url: 'https://www.expatica.com/nl/rss/news', category: 'general', source: { id: 'expatica-nl', name: 'Expatica Netherlands', url: 'https://www.expatica.com', category: 'general', language: 'en', country: 'nl' } },
  { url: 'https://www.thelocal.se/feeds/rss.php', category: 'general', source: { id: 'local-se', name: 'The Local Sweden', url: 'https://www.thelocal.se', category: 'general', language: 'en', country: 'se' } },
  { url: 'https://www.thelocal.no/feeds/rss.php', category: 'general', source: { id: 'local-no', name: 'The Local Norway', url: 'https://www.thelocal.no', category: 'general', language: 'en', country: 'no' } },
  { url: 'https://www.thelocal.dk/feeds/rss.php', category: 'general', source: { id: 'local-dk', name: 'The Local Denmark', url: 'https://www.thelocal.dk', category: 'general', language: 'en', country: 'dk' } },
  { url: 'https://www.thelocal.fi/feeds/rss.php', category: 'general', source: { id: 'local-fi', name: 'The Local Finland', url: 'https://www.thelocal.fi', category: 'general', language: 'en', country: 'fi' } },
  { url: 'https://www.thelocal.es/feeds/rss.php', category: 'general', source: { id: 'local-es', name: 'The Local Spain', url: 'https://www.thelocal.es', category: 'general', language: 'en', country: 'es' } },
  { url: 'https://www.thelocal.it/feeds/rss.php', category: 'general', source: { id: 'local-it', name: 'The Local Italy', url: 'https://www.thelocal.it', category: 'general', language: 'en', country: 'it' } },
  { url: 'https://www.thelocal.at/feeds/rss.php', category: 'general', source: { id: 'local-at', name: 'The Local Austria', url: 'https://www.thelocal.at', category: 'general', language: 'en', country: 'at' } },
  { url: 'https://www.thelocal.ch/feeds/rss.php', category: 'general', source: { id: 'local-ch', name: 'The Local Switzerland', url: 'https://www.thelocal.ch', category: 'general', language: 'en', country: 'ch' } },
  { url: 'https://www.thelocal.be/feeds/rss.php', category: 'general', source: { id: 'local-be', name: 'The Local Belgium', url: 'https://www.thelocal.be', category: 'general', language: 'en', country: 'be' } },
  { url: 'https://www.thelocal.pt/feeds/rss.php', category: 'general', source: { id: 'local-pt', name: 'The Local Portugal', url: 'https://www.thelocal.pt', category: 'general', language: 'en', country: 'pt' } },
  { url: 'https://balkaninsight.com/feed/', category: 'general', source: { id: 'bi', name: 'Balkan Insight', url: 'https://balkaninsight.com', category: 'general', language: 'en', country: 'rs' } },
  { url: 'https://www.intellinews.com/rss', category: 'business', source: { id: 'intellinews', name: 'Intellinews', url: 'https://www.intellinews.com', category: 'business', language: 'en', country: 'hu' } },
  { url: 'https://eng.belta.by/rss', category: 'general', source: { id: 'belta', name: 'Belta Belarus', url: 'https://eng.belta.by', category: 'general', language: 'en', country: 'by' } },
  { url: 'https://eng.lsm.lv/rss', category: 'general', source: { id: 'lsm', name: 'LSM Latvia', url: 'https://eng.lsm.lv', category: 'general', language: 'en', country: 'lv' } },
  { url: 'https://news.err.ee/rss', category: 'general', source: { id: 'err', name: 'ERR Estonia', url: 'https://news.err.ee', category: 'general', language: 'en', country: 'ee' } },
  { url: 'https://www.lrt.lt/rss', category: 'general', source: { id: 'lrt', name: 'LRT Lithuania', url: 'https://www.lrt.lt', category: 'general', language: 'en', country: 'lt' } },
  { url: 'https://www.praguemorning.cz/feed/', category: 'general', source: { id: 'pm', name: 'Prague Morning', url: 'https://www.praguemorning.cz', category: 'general', language: 'en', country: 'cz' } },
  { url: 'https://www.warsawvoice.pl/rss', category: 'general', source: { id: 'wv', name: 'Warsaw Voice', url: 'https://www.warsawvoice.pl', category: 'general', language: 'en', country: 'pl' } },
  { url: 'https://www.wbj.pl/rss', category: 'business', source: { id: 'wbj', name: 'Warsaw Business Journal', url: 'https://www.wbj.pl', category: 'business', language: 'en', country: 'pl' } },
  { url: 'https://bne.eu/rss', category: 'business', source: { id: 'bne', name: 'Business New Europe', url: 'https://bne.eu', category: 'business', language: 'en', country: 'ro' } },
  { url: 'https://www.balkaneu.com/feed/', category: 'general', source: { id: 'balkaneu', name: 'Balkaneu', url: 'https://www.balkaneu.com', category: 'general', language: 'en', country: 'bg' } },
  { url: 'https://www.sofiaglobe.com/feed/', category: 'general', source: { id: 'sofia', name: 'Sofia Globe', url: 'https://www.sofiaglobe.com', category: 'general', language: 'en', country: 'bg' } },
  { url: 'https://www.croatiaweek.com/feed/', category: 'general', source: { id: 'cw', name: 'Croatia Week', url: 'https://www.croatiaweek.com', category: 'general', language: 'en', country: 'hr' } },
  { url: 'https://www.sloveniatimes.com/feed/', category: 'general', source: { id: 'stimes', name: 'Slovenia Times', url: 'https://www.sloveniatimes.com', category: 'general', language: 'en', country: 'si' } },
  { url: 'https://www.thesarajevotimes.com/feed/', category: 'general', source: { id: 'sara', name: 'Sarajevo Times', url: 'https://www.thesarajevotimes.com', category: 'general', language: 'en', country: 'ba' } },
  { url: 'https://seenews.com/rss', category: 'business', source: { id: 'seenews', name: 'SeeNews', url: 'https://seenews.com', category: 'business', language: 'en', country: 'bg' } },
  { url: 'https://emerging-europe.com/feed/', category: 'business', source: { id: 'ee', name: 'Emerging Europe', url: 'https://emerging-europe.com', category: 'business', language: 'en', country: 'gb' } },
  { url: 'https://www.greekreporter.com/feed/', category: 'general', source: { id: 'gr', name: 'Greek Reporter', url: 'https://www.greekreporter.com', category: 'general', language: 'en', country: 'gr' } },
  { url: 'https://www.ekathimerini.com/rss', category: 'general', source: { id: 'eka', name: 'Kathimerini', url: 'https://www.ekathimerini.com', category: 'general', language: 'en', country: 'gr' } },
  { url: 'https://cyprus-mail.com/feed/', category: 'general', source: { id: 'cm', name: 'Cyprus Mail', url: 'https://cyprus-mail.com', category: 'general', language: 'en', country: 'cy' } },
  { url: 'https://in-cyprus.philenews.com/feed/', category: 'general', source: { id: 'incy', name: 'In Cyprus', url: 'https://in-cyprus.philenews.com', category: 'general', language: 'en', country: 'cy' } },
  { url: 'https://maltatoday.com.mt/rss', category: 'general', source: { id: 'mtoday', name: 'Malta Today', url: 'https://maltatoday.com.mt', category: 'general', language: 'en', country: 'mt' } },
  { url: 'https://timesofmalta.com/rss', category: 'general', source: { id: 'toma', name: 'Times of Malta', url: 'https://timesofmalta.com', category: 'general', language: 'en', country: 'mt' } },
  { url: 'https://www.icelandreview.com/feed/', category: 'general', source: { id: 'ir', name: 'Iceland Review', url: 'https://www.icelandreview.com', category: 'general', language: 'en', country: 'is' } },
  { url: 'https://grapevine.is/feed/', category: 'general', source: { id: 'grape', name: 'Reykjavik Grapevine', url: 'https://grapevine.is', category: 'general', language: 'en', country: 'is' } },
  { url: 'https://news.yale.edu/rss', category: 'science', source: { id: 'yale', name: 'Yale News', url: 'https://news.yale.edu', category: 'science', language: 'en', country: 'us' } },
];

// Additional feeds to fetch (Middle East, Africa, Americas)
export const ADDITIONAL_FEEDS: RSSFeed[] = [
  // === MIDDLE EAST ===
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'general', source: { id: 'aj', name: 'Al Jazeera', url: 'https://www.aljazeera.com', category: 'general', language: 'en', country: 'qa' } },
  { url: 'https://www.jordantimes.com/rss', category: 'general', source: { id: 'jtimes', name: 'Jordan Times', url: 'https://www.jordantimes.com', category: 'general', language: 'en', country: 'jo' } },
  { url: 'https://www.dailysabah.com/rss', category: 'general', source: { id: 'sabah', name: 'Daily Sabah', url: 'https://www.dailysabah.com', category: 'general', language: 'en', country: 'tr' } },
  { url: 'https://www.hurriyetdailynews.com/rss', category: 'general', source: { id: 'hurriyet', name: 'Hurriyet Daily', url: 'https://www.hurriyetdailynews.com', category: 'general', language: 'en', country: 'tr' } },
  { url: 'https://www.jpost.com/Rss/RssFeedsHeadlines.aspx', category: 'general', source: { id: 'jpost', name: 'Jerusalem Post', url: 'https://www.jpost.com', category: 'general', language: 'en', country: 'il' } },
  { url: 'https://www.timesofisrael.com/feed/', category: 'general', source: { id: 'toi', name: 'Times of Israel', url: 'https://www.timesofisrael.com', category: 'general', language: 'en', country: 'il' } },
  { url: 'https://www.haaretz.com/rss', category: 'general', source: { id: 'haaretz', name: 'Haaretz', url: 'https://www.haaretz.com', category: 'general', language: 'en', country: 'il' } },
  { url: 'https://www.egypttoday.com/rss', category: 'general', source: { id: 'etoday', name: 'Egypt Today', url: 'https://www.egypttoday.com', category: 'general', language: 'en', country: 'eg' } },
  { url: 'https://gulfnews.com/rss', category: 'general', source: { id: 'gn', name: 'Gulf News', url: 'https://gulfnews.com', category: 'general', language: 'en', country: 'ae' } },
  { url: 'https://www.khaleejtimes.com/feed', category: 'general', source: { id: 'ktimes', name: 'Khaleej Times', url: 'https://www.khaleejtimes.com', category: 'general', language: 'en', country: 'ae' } },
  { url: 'https://www.arabnews.com/rss.xml', category: 'general', source: { id: 'an', name: 'Arab News', url: 'https://www.arabnews.com', category: 'general', language: 'en', country: 'sa' } },
  { url: 'https://www.saudigazette.com.sa/rss', category: 'general', source: { id: 'sg', name: 'Saudi Gazette', url: 'https://www.saudigazette.com.sa', category: 'general', language: 'en', country: 'sa' } },
  { url: 'https://www.omanobserver.om/feed/', category: 'general', source: { id: 'oo', name: 'Oman Observer', url: 'https://www.omanobserver.om', category: 'general', language: 'en', country: 'om' } },
  { url: 'https://www.bna.bh/en/rss', category: 'general', source: { id: 'bna', name: 'Bahrain News Agency', url: 'https://www.bna.bh', category: 'general', language: 'en', country: 'bh' } },
  { url: 'https://www.qatar-tribune.com/rss', category: 'general', source: { id: 'qtrib', name: 'Qatar Tribune', url: 'https://www.qatar-tribune.com', category: 'general', language: 'en', country: 'qa' } },
  { url: 'https://www.thepeninsulaqatar.com/rss', category: 'general', source: { id: 'peninsula', name: 'The Peninsula Qatar', url: 'https://www.thepeninsulaqatar.com', category: 'general', language: 'en', country: 'qa' } },
  { url: 'https://www.middleeasteye.net/rss', category: 'general', source: { id: 'mee', name: 'Middle East Eye', url: 'https://www.middleeasteye.net', category: 'general', language: 'en', country: 'gb' } },
  { url: 'https://www.middleeastmonitor.com/feed/', category: 'general', source: { id: 'mem', name: 'Middle East Monitor', url: 'https://www.middleeastmonitor.com', category: 'general', language: 'en', country: 'gb' } },
  { url: 'https://www.rudaw.net/rss', category: 'general', source: { id: 'rudaw', name: 'Rudaw', url: 'https://www.rudaw.net', category: 'general', language: 'en', country: 'iq' } },
  { url: 'https://www.iraqinews.com/feed/', category: 'general', source: { id: 'iraqinews', name: 'Iraqi News', url: 'https://www.iraqinews.com', category: 'general', language: 'en', country: 'iq' } },
  { url: 'https://www.lebanon24.com/rss', category: 'general', source: { id: 'l24', name: 'Lebanon 24', url: 'https://www.lebanon24.com', category: 'general', language: 'en', country: 'lb' } },
  { url: 'https://www.dailystar.com.lb/rss', category: 'general', source: { id: 'dailystar', name: 'Daily Star Lebanon', url: 'https://www.dailystar.com.lb', category: 'general', language: 'en', country: 'lb' } },
  { url: 'https://www.syriahr.com/en/feed/', category: 'general', source: { id: 'sohr', name: 'Syria Observatory', url: 'https://www.syriahr.com', category: 'general', language: 'en', country: 'sy' } },
  { url: 'https://en.rian.ru/rss', category: 'general', source: { id: 'ria', name: 'RIA Novosti', url: 'https://en.rian.ru', category: 'general', language: 'en', country: 'ru' } },
  { url: 'https://sputniknews.com/export/rss2/archive/index.xml', category: 'general', source: { id: 'sputnik', name: 'Sputnik', url: 'https://sputniknews.com', category: 'general', language: 'en', country: 'ru' } },
  { url: 'https://tass.com/rss/v2.xml', category: 'general', source: { id: 'tass', name: 'TASS', url: 'https://tass.com', category: 'general', language: 'en', country: 'ru' } },
  
  // === AFRICA ===
  { url: 'https://mg.co.za/feed/', category: 'general', source: { id: 'mg', name: 'Mail & Guardian', url: 'https://mg.co.za', category: 'general', language: 'en', country: 'za' } },
  { url: 'https://www.news24.com/rss', category: 'general', source: { id: 'n24', name: 'News24', url: 'https://www.news24.com', category: 'general', language: 'en', country: 'za' } },
  { url: 'https://www.sowetanlive.co.za/rss', category: 'general', source: { id: 'sowetan', name: 'Sowetan Live', url: 'https://www.sowetanlive.co.za', category: 'general', language: 'en', country: 'za' } },
  { url: 'https://www.timeslive.co.za/rss', category: 'general', source: { id: 'timeslive', name: 'Times Live', url: 'https://www.timeslive.co.za', category: 'general', language: 'en', country: 'za' } },
  { url: 'https://www.businesslive.co.za/rss', category: 'business', source: { id: 'blive', name: 'Business Live', url: 'https://www.businesslive.co.za', category: 'business', language: 'en', country: 'za' } },
  { url: 'https://www.premiumtimesng.com/feed', category: 'general', source: { id: 'pt', name: 'Premium Times', url: 'https://www.premiumtimesng.com', category: 'general', language: 'en', country: 'ng' } },
  { url: 'https://www.vanguardngr.com/feed/', category: 'general', source: { id: 'vanguard', name: 'Vanguard Nigeria', url: 'https://www.vanguardngr.com', category: 'general', language: 'en', country: 'ng' } },
  { url: 'https://punchng.com/feed/', category: 'general', source: { id: 'punch', name: 'Punch Nigeria', url: 'https://punchng.com', category: 'general', language: 'en', country: 'ng' } },
  { url: 'https://guardian.ng/feed/', category: 'general', source: { id: 'guardian-ng', name: 'Guardian Nigeria', url: 'https://guardian.ng', category: 'general', language: 'en', country: 'ng' } },
  { url: 'https://www.thisdaylive.com/index.php/feed/', category: 'general', source: { id: 'thisday', name: 'This Day', url: 'https://www.thisdaylive.com', category: 'general', language: 'en', country: 'ng' } },
  { url: 'https://nation.africa/kenya/rss', category: 'general', source: { id: 'nation', name: 'Daily Nation', url: 'https://nation.africa', category: 'general', language: 'en', country: 'ke' } },
  { url: 'https://www.theeastafrican.co.ke/rss', category: 'general', source: { id: 'tea', name: 'The East African', url: 'https://www.theeastafrican.co.ke', category: 'general', language: 'en', country: 'ke' } },
  { url: 'https://www.standardmedia.co.ke/rss', category: 'general', source: { id: 'standard', name: 'The Standard', url: 'https://www.standardmedia.co.ke', category: 'general', language: 'en', country: 'ke' } },
  { url: 'https://www.businessdailyafrica.com/rss', category: 'business', source: { id: 'bd', name: 'Business Daily', url: 'https://www.businessdailyafrica.com', category: 'business', language: 'en', country: 'ke' } },
  { url: 'https://www.capitalfm.co.ke/rss', category: 'general', source: { id: 'capital', name: 'Capital FM', url: 'https://www.capitalfm.co.ke', category: 'general', language: 'en', country: 'ke' } },
  { url: 'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf', category: 'general', source: { id: 'aa', name: 'AllAfrica', url: 'https://allafrica.com', category: 'general', language: 'en', country: 'za' } },
  { url: 'https://www.africanews.com/rss', category: 'general', source: { id: 'ane', name: 'Africa News', url: 'https://www.africanews.com', category: 'general', language: 'en', country: 'fr' } },
  { url: 'https://www.egyptindependent.com/feed/', category: 'general', source: { id: 'ei', name: 'Egypt Independent', url: 'https://www.egyptindependent.com', category: 'general', language: 'en', country: 'eg' } },
  { url: 'https://www.madamasr.com/en/rss', category: 'general', source: { id: 'mada', name: 'Mada Masr', url: 'https://www.madamasr.com', category: 'general', language: 'en', country: 'eg' } },
  { url: 'https://www.ethiopianreporter.com/feed', category: 'general', source: { id: 'er', name: 'Ethiopian Reporter', url: 'https://www.ethiopianreporter.com', category: 'general', language: 'en', country: 'et' } },
  { url: 'https://addisstandard.com/feed/', category: 'general', source: { id: 'as', name: 'Addis Standard', url: 'https://addisstandard.com', category: 'general', language: 'en', country: 'et' } },
  { url: 'https://www.dailynews.co.tz/rss', category: 'general', source: { id: 'dn', name: 'Daily News Tanzania', url: 'https://www.dailynews.co.tz', category: 'general', language: 'en', country: 'tz' } },
  { url: 'https://www.thecitizen.co.tz/rss', category: 'general', source: { id: 'citizen', name: 'The Citizen', url: 'https://www.thecitizen.co.tz', category: 'general', language: 'en', country: 'tz' } },
  { url: 'https://www.monitor.co.ug/rss', category: 'general', source: { id: 'monitor', name: 'Daily Monitor', url: 'https://www.monitor.co.ug', category: 'general', language: 'en', country: 'ug' } },
  { url: 'https://www.newvision.co.ug/rss', category: 'general', source: { id: 'nv', name: 'New Vision', url: 'https://www.newvision.co.ug', category: 'general', language: 'en', country: 'ug' } },
  { url: 'https://www.ghanaguardian.com/rss', category: 'general', source: { id: 'gg', name: 'Ghana Guardian', url: 'https://www.ghanaguardian.com', category: 'general', language: 'en', country: 'gh' } },
  { url: 'https://www.graphic.com.gh/rss', category: 'general', source: { id: 'graphic', name: 'Graphic Online', url: 'https://www.graphic.com.gh', category: 'general', language: 'en', country: 'gh' } },
  { url: 'https://www.moroccoworldnews.com/feed/', category: 'general', source: { id: 'mwn', name: 'Morocco World News', url: 'https://www.moroccoworldnews.com', category: 'general', language: 'en', country: 'ma' } },
  { url: 'https://www.northafricapost.com/rss', category: 'general', source: { id: 'nap', name: 'North Africa Post', url: 'https://www.northafricapost.com', category: 'general', language: 'en', country: 'ma' } },
  { url: 'https://www.enca.com/rss', category: 'general', source: { id: 'enca', name: 'eNCA', url: 'https://www.enca.com', category: 'general', language: 'en', country: 'za' } },
  { url: 'https://ewn.co.za/rss', category: 'general', source: { id: 'ewn', name: 'Eyewitness News', url: 'https://ewn.co.za', category: 'general', language: 'en', country: 'za' } },
  { url: 'https://www.iol.co.za/rss', category: 'general', source: { id: 'iol', name: 'Independent Online', url: 'https://www.iol.co.za', category: 'general', language: 'en', country: 'za' } },
  { url: 'https://www.africanbusinessmagazine.com/feed/', category: 'business', source: { id: 'abm', name: 'African Business', url: 'https://www.africanbusinessmagazine.com', category: 'business', language: 'en', country: 'gb' } },
  { url: 'https://www.afrik21.africa/feed/', category: 'environment', source: { id: 'afrik21', name: 'Afrik 21', url: 'https://www.afrik21.africa', category: 'environment', language: 'en', country: 'fr' } },
  { url: 'https://www.smartafrica.org/rss', category: 'technology', source: { id: 'sa', name: 'Smart Africa', url: 'https://www.smartafrica.org', category: 'technology', language: 'en', country: 'rw' } },
  { url: 'https://www.newtimes.co.rw/rss', category: 'general', source: { id: 'nt', name: 'The New Times', url: 'https://www.newtimes.co.rw', category: 'general', language: 'en', country: 'rw' } },
  { url: 'https://www.ktpress.rw/feed/', category: 'general', source: { id: 'kt', name: 'KT Press', url: 'https://www.ktpress.rw', category: 'general', language: 'en', country: 'rw' } },
  { url: 'https://www.horizonweekly.ca/en/feed/', category: 'general', source: { id: 'hw', name: 'Horizon Weekly', url: 'https://www.horizonweekly.ca', category: 'general', language: 'en', country: 'dz' } },
  { url: 'https://www.tunisienumerique.com/en/rss', category: 'general', source: { id: 'tn', name: 'Tunisie Numerique', url: 'https://www.tunisienumerique.com', category: 'general', language: 'en', country: 'tn' } },
  { url: 'https://www.libyaherald.com/feed/', category: 'general', source: { id: 'lh', name: 'Libya Herald', url: 'https://www.libyaherald.com', category: 'general', language: 'en', country: 'ly' } },
  { url: 'https://www.sudantribune.com/rss', category: 'general', source: { id: 'st', name: 'Sudan Tribune', url: 'https://www.sudantribune.com', category: 'general', language: 'en', country: 'sd' } },
  { url: 'https://darfur24.com/feed/', category: 'general', source: { id: 'd24', name: 'Darfur 24', url: 'https://darfur24.com', category: 'general', language: 'en', country: 'sd' } },
  { url: 'https://southernsudannewsagency.org/feed/', category: 'general', source: { id: 'ssna', name: 'South Sudan News', url: 'https://southernsudannewsagency.org', category: 'general', language: 'en', country: 'ss' } },
  { url: 'https://eyeradio.org/feed/', category: 'general', source: { id: 'eye', name: 'Eye Radio', url: 'https://eyeradio.org', category: 'general', language: 'en', country: 'ss' } },
  { url: 'https://www.radiotamazuj.org/en/rss', category: 'general', source: { id: 'tamazuj', name: 'Radio Tamazuj', url: 'https://www.radiotamazuj.org', category: 'general', language: 'en', country: 'ss' } },
  { url: 'https://www.zambiawatchdog.com/feed/', category: 'general', source: { id: 'zw', name: 'Zambia Watchdog', url: 'https://www.zambiawatchdog.com', category: 'general', language: 'en', country: 'zm' } },
  { url: 'https://www.lusakatimes.com/feed/', category: 'general', source: { id: 'ltz', name: 'Lusaka Times', url: 'https://www.lusakatimes.com', category: 'general', language: 'en', country: 'zm' } },
  { url: 'https://www.times.co.zm/feed/', category: 'general', source: { id: 'tzm', name: 'Times of Zambia', url: 'https://www.times.co.zm', category: 'general', language: 'en', country: 'zm' } },
  { url: 'https://www.zbc.co.zw/feed/', category: 'general', source: { id: 'zbc', name: 'ZBC News', url: 'https://www.zbc.co.zw', category: 'general', language: 'en', country: 'zw' } },
  { url: 'https://www.newsday.co.zw/feed/', category: 'general', source: { id: 'nday', name: 'NewsDay Zimbabwe', url: 'https://www.newsday.co.zw', category: 'general', language: 'en', country: 'zw' } },
  { url: 'https://www.thezimbabwean.co/feed/', category: 'general', source: { id: 'tz', name: 'The Zimbabwean', url: 'https://www.thezimbabwean.co', category: 'general', language: 'en', country: 'zw' } },
  { url: 'https://www.botswanaguardian.co.bw/rss', category: 'general', source: { id: 'bg', name: 'Botswana Guardian', url: 'https://www.botswanaguardian.co.bw', category: 'general', language: 'en', country: 'bw' } },
  { url: 'https://www.mmegi.bw/feed/', category: 'general', source: { id: 'mmegi', name: 'Mmegi', url: 'https://www.mmegi.bw', category: 'general', language: 'en', country: 'bw' } },
  { url: 'https://www.namibian.com.na/rss', category: 'general', source: { id: 'namibian', name: 'The Namibian', url: 'https://www.namibian.com.na', category: 'general', language: 'en', country: 'na' } },
  { url: 'https://www.newera.com.na/feed/', category: 'general', source: { id: 'newera', name: 'New Era', url: 'https://www.newera.com.na', category: 'general', language: 'en', country: 'na' } },
  { url: 'https://www.mozambiquechannel.com/feed/', category: 'general', source: { id: 'mc', name: 'Mozambique Channel', url: 'https://www.mozambiquechannel.com', category: 'general', language: 'en', country: 'mz' } },
  { url: 'https://clubofmozambique.com/feed/', category: 'general', source: { id: 'com', name: 'Club of Mozambique', url: 'https://clubofmozambique.com', category: 'general', language: 'en', country: 'mz' } },
  { url: 'https://www.madagascar-tribune.com/feed/', category: 'general', source: { id: 'mtrib', name: 'Madagascar Tribune', url: 'https://www.madagascar-tribune.com', category: 'general', language: 'en', country: 'mg' } },
  { url: 'https://www.midi-madagascar.mg/en/rss', category: 'general', source: { id: 'midim', name: 'Midi Madagascar', url: 'https://www.midi-madagascar.mg', category: 'general', language: 'en', country: 'mg' } },
  { url: 'https://www.cameroonjournal.com/feed/', category: 'general', source: { id: 'cj', name: 'Cameroon Journal', url: 'https://www.cameroonjournal.com', category: 'general', language: 'en', country: 'cm' } },
  { url: 'https://www.journalducameroun.com/en/feed/', category: 'general', source: { id: 'jdc', name: 'Journal du Cameroun', url: 'https://www.journalducameroun.com', category: 'general', language: 'en', country: 'cm' } },
  { url: 'https://www.africareview.com/rss', category: 'general', source: { id: 'ar', name: 'Africa Review', url: 'https://www.africareview.com', category: 'general', language: 'en', country: 'ke' } },
  { url: 'https://www.theafricareport.com/rss', category: 'business', source: { id: 'taf', name: 'The Africa Report', url: 'https://www.theafricareport.com', category: 'business', language: 'en', country: 'fr' } },
  { url: 'https://www.africanexponent.com/rss', category: 'general', source: { id: 'ae', name: 'African Exponent', url: 'https://www.africanexponent.com', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://face2faceafrica.com/feed/', category: 'general', source: { id: 'f2fa', name: 'Face2Face Africa', url: 'https://face2faceafrica.com', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://www.panapress.com/rss', category: 'general', source: { id: 'pana', name: 'PanaPress', url: 'https://www.panapress.com', category: 'general', language: 'en', country: 'sn' } },
  { url: 'https://www.jeuneafrique.com/rss', category: 'general', source: { id: 'ja', name: 'Jeune Afrique', url: 'https://www.jeuneafrique.com', category: 'general', language: 'fr', country: 'fr' } },
  
  // === AMERICAS ===
  // North America - US
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'general', source: { id: 'nyt', name: 'New York Times', url: 'https://www.nytimes.com', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://www.washingtonpost.com/world/rss', category: 'general', source: { id: 'wapo', name: 'Washington Post', url: 'https://www.washingtonpost.com', category: 'general', language: 'en', country: 'us' } },
  { url: 'http://rss.cnn.com/rss/edition_world.rss', category: 'general', source: { id: 'cnn', name: 'CNN', url: 'https://www.cnn.com', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://feeds.npr.org/1001/rss.xml', category: 'general', source: { id: 'npr', name: 'NPR', url: 'https://www.npr.org', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://feeds.abcnews.com/abcnews/topstories', category: 'general', source: { id: 'abc', name: 'ABC News', url: 'https://abcnews.go.com', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://moxie.foxnews.com/google-publisher/latest.xml', category: 'general', source: { id: 'fox', name: 'Fox News', url: 'https://www.foxnews.com', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://feeds.cbsnews.com/CBSNewsMain', category: 'general', source: { id: 'cbs', name: 'CBS News', url: 'https://www.cbsnews.com', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://www.usatoday.com/rss', category: 'general', source: { id: 'usat', name: 'USA Today', url: 'https://www.usatoday.com', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://www.wsj.com/xml/rss/3_7031.xml', category: 'business', source: { id: 'wsj', name: 'Wall Street Journal', url: 'https://www.wsj.com', category: 'business', language: 'en', country: 'us' } },
  { url: 'https://feeds.bloomberg.com/news.rss', category: 'business', source: { id: 'bloomberg', name: 'Bloomberg', url: 'https://www.bloomberg.com', category: 'business', language: 'en', country: 'us' } },
  { url: 'https://www.forbes.com/real-time/feed/', category: 'business', source: { id: 'forbes', name: 'Forbes', url: 'https://www.forbes.com', category: 'business', language: 'en', country: 'us' } },
  { url: 'https://www.businessinsider.com/rss', category: 'business', source: { id: 'bi', name: 'Business Insider', url: 'https://www.businessinsider.com', category: 'business', language: 'en', country: 'us' } },
  { url: 'https://www.latimes.com/world/rss', category: 'general', source: { id: 'lat', name: 'LA Times', url: 'https://www.latimes.com', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://www.chicagotribune.com/rss', category: 'general', source: { id: 'ct', name: 'Chicago Tribune', url: 'https://www.chicagotribune.com', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://nypost.com/feed/', category: 'general', source: { id: 'nyp', name: 'New York Post', url: 'https://nypost.com', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://www.newsweek.com/rss', category: 'general', source: { id: 'nw', name: 'Newsweek', url: 'https://www.newsweek.com', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://time.com/feed/', category: 'general', source: { id: 'time', name: 'TIME', url: 'https://time.com', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://www.theatlantic.com/feed/all/', category: 'general', source: { id: 'atlantic', name: 'The Atlantic', url: 'https://www.theatlantic.com', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://www.newyorker.com/feed/everything', category: 'general', source: { id: 'nyer', name: 'The New Yorker', url: 'https://www.newyorker.com', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://slate.com/feeds/all.rss', category: 'general', source: { id: 'slate', name: 'Slate', url: 'https://slate.com', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://feeds.vox.com/vox', category: 'general', source: { id: 'vox', name: 'Vox', url: 'https://www.vox.com', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://www.salon.com/feed/', category: 'general', source: { id: 'salon', name: 'Salon', url: 'https://www.salon.com', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://www.politico.com/rss/politics08.xml', category: 'politics', source: { id: 'politico', name: 'Politico', url: 'https://www.politico.com', category: 'politics', language: 'en', country: 'us' } },
  { url: 'https://www.axios.com/feeds/feed.rss', category: 'general', source: { id: 'axios', name: 'Axios', url: 'https://www.axios.com', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://www.pbs.org/newshour/feeds/rss/headlines', category: 'general', source: { id: 'pbs', name: 'PBS NewsHour', url: 'https://www.pbs.org/newshour', category: 'general', language: 'en', country: 'us' } },
  
  // Canada
  { url: 'https://www.cbc.ca/cmlink/rss-world', category: 'general', source: { id: 'cbc', name: 'CBC News', url: 'https://www.cbc.ca', category: 'general', language: 'en', country: 'ca' } },
  { url: 'https://www.theglobeandmail.com/rss', category: 'general', source: { id: 'globe', name: 'Globe and Mail', url: 'https://www.theglobeandmail.com', category: 'general', language: 'en', country: 'ca' } },
  { url: 'https://nationalpost.com/feed/', category: 'general', source: { id: 'np', name: 'National Post', url: 'https://nationalpost.com', category: 'general', language: 'en', country: 'ca' } },
  { url: 'https://www.thestar.com/rss', category: 'general', source: { id: 'star', name: 'Toronto Star', url: 'https://www.thestar.com', category: 'general', language: 'en', country: 'ca' } },
  { url: 'https://montrealgazette.com/feed/', category: 'general', source: { id: 'mg', name: 'Montreal Gazette', url: 'https://montrealgazette.com', category: 'general', language: 'en', country: 'ca' } },
  { url: 'https://www.vancouver sun.com/rss', category: 'general', source: { id: 'vs', name: 'Vancouver Sun', url: 'https://www.vancouversun.com', category: 'general', language: 'en', country: 'ca' } },
  { url: 'https://www.cpac.ca/en/rss', category: 'general', source: { id: 'cpac', name: 'CPAC', url: 'https://www.cpac.ca', category: 'general', language: 'en', country: 'ca' } },
  { url: 'https://www.ipolitics.ca/feed/', category: 'politics', source: { id: 'ipolitics', name: 'iPolitics', url: 'https://www.ipolitics.ca', category: 'politics', language: 'en', country: 'ca' } },
  
  // Latin America - Brazil
  { url: 'https://feeds.folha.uol.com.br/emcimadahora/rss091.xml', category: 'general', source: { id: 'folha', name: 'Folha de S.Paulo', url: 'https://www.folha.uol.com.br', category: 'general', language: 'pt', country: 'br' } },
  { url: 'https://g1.globo.com/rss/g1/', category: 'general', source: { id: 'g1', name: 'Globo G1', url: 'https://g1.globo.com', category: 'general', language: 'pt', country: 'br' } },
  { url: 'https://www.brasil247.com/feed/', category: 'general', source: { id: 'b247', name: 'Brasil 247', url: 'https://www.brasil247.com', category: 'general', language: 'pt', country: 'br' } },
  { url: 'https://www.cartacapital.com.br/rss', category: 'general', source: { id: 'cc', name: 'Carta Capital', url: 'https://www.cartacapital.com.br', category: 'general', language: 'pt', country: 'br' } },
  { url: 'https://www.valor.com.br/rss', category: 'business', source: { id: 'valor', name: 'Valor Economico', url: 'https://www.valor.com.br', category: 'business', language: 'pt', country: 'br' } },
  
  // Argentina
  { url: 'https://www.clarin.com/rss/lo-ultimo/', category: 'general', source: { id: 'clarin', name: 'Clarin', url: 'https://www.clarin.com', category: 'general', language: 'es', country: 'ar' } },
  { url: 'https://www.lanacion.com.ar/rss/', category: 'general', source: { id: 'lanacion', name: 'La Nacion', url: 'https://www.lanacion.com.ar', category: 'general', language: 'es', country: 'ar' } },
  { url: 'https://www.pagina12.com.ar/rss', category: 'general', source: { id: 'p12', name: 'Pagina 12', url: 'https://www.pagina12.com.ar', category: 'general', language: 'es', country: 'ar' } },
  { url: 'https://www.infobae.com/argentina/rss/', category: 'general', source: { id: 'infobae', name: 'Infobae', url: 'https://www.infobae.com', category: 'general', language: 'es', country: 'ar' } },
  { url: 'https://www.ambito.com/rss', category: 'business', source: { id: 'ambito', name: 'Ambito Financiero', url: 'https://www.ambito.com', category: 'business', language: 'es', country: 'ar' } },
  
  // Mexico
  { url: 'https://www.reforma.com/rss/', category: 'general', source: { id: 'reforma', name: 'Reforma', url: 'https://www.reforma.com', category: 'general', language: 'es', country: 'mx' } },
  { url: 'https://www.eluniversal.com.mx/rss', category: 'general', source: { id: 'universal', name: 'El Universal', url: 'https://www.eluniversal.com.mx', category: 'general', language: 'es', country: 'mx' } },
  { url: 'https://www.jornada.com.mx/rss', category: 'general', source: { id: 'jornada', name: 'La Jornada', url: 'https://www.jornada.com.mx', category: 'general', language: 'es', country: 'mx' } },
  { url: 'https://www.milenio.com/rss', category: 'general', source: { id: 'milenio', name: 'Milenio', url: 'https://www.milenio.com', category: 'general', language: 'es', country: 'mx' } },
  { url: 'https://www.elsoldemexico.com.mx/rss', category: 'general', source: { id: 'sdm', name: 'El Sol de Mexico', url: 'https://www.elsoldemexico.com.mx', category: 'general', language: 'es', country: 'mx' } },
  
  // Chile
  { url: 'https://www.emol.com/rss', category: 'general', source: { id: 'emol', name: 'El Mercurio', url: 'https://www.emol.com', category: 'general', language: 'es', country: 'cl' } },
  { url: 'https://www.latercera.com/feed/', category: 'general', source: { id: 'tercera', name: 'La Tercera', url: 'https://www.latercera.com', category: 'general', language: 'es', country: 'cl' } },
  { url: 'https://www.lanacion.cl/feed/', category: 'general', source: { id: 'nacioncl', name: 'La Nacion Chile', url: 'https://www.lanacion.cl', category: 'general', language: 'es', country: 'cl' } },
  { url: 'https://www.biobiochile.cl/feed/', category: 'general', source: { id: 'bio', name: 'BioBioChile', url: 'https://www.biobiochile.cl', category: 'general', language: 'es', country: 'cl' } },
  
  // Colombia
  { url: 'https://www.eltiempo.com/rss', category: 'general', source: { id: 'eltiempo', name: 'El Tiempo', url: 'https://www.eltiempo.com', category: 'general', language: 'es', country: 'co' } },
  { url: 'https://www.elespectador.com/feed/', category: 'general', source: { id: 'espectador', name: 'El Espectador', url: 'https://www.elespectador.com', category: 'general', language: 'es', country: 'co' } },
  { url: 'https://www.semana.com/feed/', category: 'general', source: { id: 'semana', name: 'Semana', url: 'https://www.semana.com', category: 'general', language: 'es', country: 'co' } },
  { url: 'https://www.portafolio.co/rss', category: 'business', source: { id: 'portafolio', name: 'Portafolio', url: 'https://www.portafolio.co', category: 'business', language: 'es', country: 'co' } },
  
  // Peru
  { url: 'https://elcomercio.pe/feed/', category: 'general', source: { id: 'ecomercio', name: 'El Comercio', url: 'https://elcomercio.pe', category: 'general', language: 'es', country: 'pe' } },
  { url: 'https://gestion.pe/feed/', category: 'business', source: { id: 'gestion', name: 'Gestion', url: 'https://gestion.pe', category: 'business', language: 'es', country: 'pe' } },
  { url: 'https://larepublica.pe/feed/', category: 'general', source: { id: 'larepublica', name: 'La Republica', url: 'https://larepublica.pe', category: 'general', language: 'es', country: 'pe' } },
  
  // Venezuela
  { url: 'https://www.eluniversal.com/rss', category: 'general', source: { id: 'eu', name: 'El Universal', url: 'https://www.eluniversal.com', category: 'general', language: 'es', country: 've' } },
  { url: 'https://www.elnacional.com/feed/', category: 'general', source: { id: 'elnacional', name: 'El Nacional', url: 'https://www.elnacional.com', category: 'general', language: 'es', country: 've' } },
  { url: 'https://www.lapatilla.com/feed/', category: 'general', source: { id: 'lp', name: 'La Patilla', url: 'https://www.lapatilla.com', category: 'general', language: 'es', country: 've' } },
  
  // Other Latin America
  { url: 'https://www.elpais.com.co/rss', category: 'general', source: { id: 'epco', name: 'El Pais Colombia', url: 'https://www.elpais.com.co', category: 'general', language: 'es', country: 'co' } },
  { url: 'https://www.elobservador.com.uy/rss', category: 'general', source: { id: 'eo', name: 'El Observador', url: 'https://www.elobservador.com.uy', category: 'general', language: 'es', country: 'uy' } },
  { url: 'https://www.montevideo.com.uy/rss', category: 'general', source: { id: 'mvd', name: 'Montevideo Portal', url: 'https://www.montevideo.com.uy', category: 'general', language: 'es', country: 'uy' } },
  { url: 'https://www.eldia.com/rss', category: 'general', source: { id: 'eldia', name: 'El Dia', url: 'https://www.eldia.com', category: 'general', language: 'es', country: 'ar' } },
  { url: 'https://www.elsalvador.com/rss', category: 'general', source: { id: 'es', name: 'El Salvador', url: 'https://www.elsalvador.com', category: 'general', language: 'es', country: 'sv' } },
  { url: 'https://www.laprensagrafica.com/rss', category: 'general', source: { id: 'lpg', name: 'La Prensa Grafica', url: 'https://www.laprensagrafica.com', category: 'general', language: 'es', country: 'sv' } },
  { url: 'https://www.prensalibre.com/rss', category: 'general', source: { id: 'pl', name: 'Prensa Libre', url: 'https://www.prensalibre.com', category: 'general', language: 'es', country: 'gt' } },
  { url: 'https://www.elheraldo.hn/rss', category: 'general', source: { id: 'eh', name: 'El Heraldo', url: 'https://www.elheraldo.hn', category: 'general', language: 'es', country: 'hn' } },
  { url: 'https://www.laprensa.hn/rss', category: 'general', source: { id: 'lphn', name: 'La Prensa Honduras', url: 'https://www.laprensa.hn', category: 'general', language: 'es', country: 'hn' } },
  { url: 'https://www.laprensa.com.ni/feed/', category: 'general', source: { id: 'lpni', name: 'La Prensa Nicaragua', url: 'https://www.laprensa.com.ni', category: 'general', language: 'es', country: 'ni' } },
  { url: 'https://www.nacion.com/rss', category: 'general', source: { id: 'nacion', name: 'La Nacion Costa Rica', url: 'https://www.nacion.com', category: 'general', language: 'es', country: 'cr' } },
  { url: 'https://www.crhoy.com/feed/', category: 'general', source: { id: 'crh', name: 'CR Hoy', url: 'https://www.crhoy.com', category: 'general', language: 'es', country: 'cr' } },
  { url: 'https://www.panamaamerica.com.pa/rss', category: 'general', source: { id: 'pa', name: 'Panama America', url: 'https://www.panamaamerica.com.pa', category: 'general', language: 'es', country: 'pa' } },
  { url: 'https://www.laestrella.com.pa/rss', category: 'general', source: { id: 'le', name: 'La Estrella', url: 'https://www.laestrella.com.pa', category: 'general', language: 'es', country: 'pa' } },
  { url: 'https://www.cubaencuentro.com/rss', category: 'general', source: { id: 'ce', name: 'Cuba Encuentro', url: 'https://www.cubaencuentro.com', category: 'general', language: 'es', country: 'cu' } },
  { url: 'https://www.14ymedio.com/rss', category: 'general', source: { id: '14y', name: '14ymedio', url: 'https://www.14ymedio.com', category: 'general', language: 'es', country: 'cu' } },
  { url: 'https://www.diariodecuba.com/rss', category: 'general', source: { id: 'ddc', name: 'Diario de Cuba', url: 'https://www.diariodecuba.com', category: 'general', language: 'es', country: 'cu' } },
  { url: 'https://www.jamaicaobserver.com/rss', category: 'general', source: { id: 'jo', name: 'Jamaica Observer', url: 'https://www.jamaicaobserver.com', category: 'general', language: 'en', country: 'jm' } },
  { url: 'https://jamaica-gleaner.com/rss', category: 'general', source: { id: 'jg', name: 'Jamaica Gleaner', url: 'https://jamaica-gleaner.com', category: 'general', language: 'en', country: 'jm' } },
  { url: 'https://www.trinidadexpress.com/rss', category: 'general', source: { id: 'te', name: 'Trinidad Express', url: 'https://www.trinidadexpress.com', category: 'general', language: 'en', country: 'tt' } },
  { url: 'https://www.stabroeknews.com/feed/', category: 'general', source: { id: 'sn', name: 'Stabroek News', url: 'https://www.stabroeknews.com', category: 'general', language: 'en', country: 'gy' } },
  { url: 'https://www.kaieteurnewsonline.com/feed/', category: 'general', source: { id: 'kn', name: 'Kaieteur News', url: 'https://www.kaieteurnewsonline.com', category: 'general', language: 'en', country: 'gy' } },
  { url: 'https://www.lanacion.com.py/rss', category: 'general', source: { id: 'lnpy', name: 'La Nacion Paraguay', url: 'https://www.lanacion.com.py', category: 'general', language: 'es', country: 'py' } },
  { url: 'https://www.ultimahora.com/rss', category: 'general', source: { id: 'uh', name: 'Ultima Hora', url: 'https://www.ultimahora.com', category: 'general', language: 'es', country: 'py' } },
  { url: 'https://www.elcomercio.com/rss', category: 'general', source: { id: 'ece', name: 'El Comercio Ecuador', url: 'https://www.elcomercio.com', category: 'general', language: 'es', country: 'ec' } },
  { url: 'https://www.eluniverso.com/rss', category: 'general', source: { id: 'euniv', name: 'El Universo', url: 'https://www.eluniverso.com', category: 'general', language: 'es', country: 'ec' } },
  { url: 'https://www.eltelegrafo.com.ec/rss', category: 'general', source: { id: 'etel', name: 'El Telegrafo', url: 'https://www.eltelegrafo.com.ec', category: 'general', language: 'es', country: 'ec' } },
  { url: 'https://www.opinion.com.bo/rss', category: 'general', source: { id: 'op', name: 'Opinion Bolivia', url: 'https://www.opinion.com.bo', category: 'general', language: 'es', country: 'bo' } },
  { url: 'https://www.eldeber.com.bo/rss', category: 'general', source: { id: 'edeber', name: 'El Deber', url: 'https://www.eldeber.com.bo', category: 'general', language: 'es', country: 'bo' } },
  { url: 'https://www.lostiempos.com/rss', category: 'general', source: { id: 'lt', name: 'Los Tiempos', url: 'https://www.lostiempos.com', category: 'general', language: 'es', country: 'bo' } },
  { url: 'https://www.paginasiete.bo/rss', category: 'general', source: { id: 'ps', name: 'Pagina Siete', url: 'https://www.paginasiete.bo', category: 'general', language: 'es', country: 'bo' } },
  
  // === OCEANIA ===
  { url: 'https://www.abc.net.au/news/feed/2942460/rss.xml', category: 'general', source: { id: 'abc', name: 'ABC News Australia', url: 'https://www.abc.net.au', category: 'general', language: 'en', country: 'au' } },
  { url: 'https://www.smh.com.au/rss/feed.xml', category: 'general', source: { id: 'smh', name: 'Sydney Morning Herald', url: 'https://www.smh.com.au', category: 'general', language: 'en', country: 'au' } },
  { url: 'https://www.theage.com.au/rss', category: 'general', source: { id: 'age', name: 'The Age', url: 'https://www.theage.com.au', category: 'general', language: 'en', country: 'au' } },
  { url: 'https://www.dailytelegraph.com.au/rss', category: 'general', source: { id: 'dt', name: 'Daily Telegraph', url: 'https://www.dailytelegraph.com.au', category: 'general', language: 'en', country: 'au' } },
  { url: 'https://www.heraldsun.com.au/rss', category: 'general', source: { id: 'hs', name: 'Herald Sun', url: 'https://www.heraldsun.com.au', category: 'general', language: 'en', country: 'au' } },
  { url: 'https://www.couriermail.com.au/rss', category: 'general', source: { id: 'cm', name: 'Courier Mail', url: 'https://www.couriermail.com.au', category: 'general', language: 'en', country: 'au' } },
  { url: 'https://www.nzherald.co.nz/arc/outboundfeeds/rss/section/1/', category: 'general', source: { id: 'nzh', name: 'NZ Herald', url: 'https://www.nzherald.co.nz', category: 'general', language: 'en', country: 'nz' } },
  { url: 'https://www.stuff.co.nz/rss', category: 'general', source: { id: 'stuff', name: 'Stuff', url: 'https://www.stuff.co.nz', category: 'general', language: 'en', country: 'nz' } },
  { url: 'https://www.rnz.co.nz/rss', category: 'general', source: { id: 'rnz', name: 'RNZ', url: 'https://www.rnz.co.nz', category: 'general', language: 'en', country: 'nz' } },
  { url: 'https://www.newsroom.co.nz/rss', category: 'general', source: { id: 'newsroom', name: 'Newsroom', url: 'https://www.newsroom.co.nz', category: 'general', language: 'en', country: 'nz' } },
  { url: 'https://www.fijitimes.com/feed/', category: 'general', source: { id: 'ft', name: 'Fiji Times', url: 'https://www.fijitimes.com', category: 'general', language: 'en', country: 'fj' } },
  { url: 'https://www.fbcnews.com.fj/rss', category: 'general', source: { id: 'fbc', name: 'FBC News', url: 'https://www.fbcnews.com.fj', category: 'general', language: 'en', country: 'fj' } },
  { url: 'https://www.looppng.com/rss', category: 'general', source: { id: 'lpng', name: 'Loop PNG', url: 'https://www.looppng.com', category: 'general', language: 'en', country: 'pg' } },
  { url: 'https://www.postcourier.com.pg/feed/', category: 'general', source: { id: 'pc', name: 'Post Courier', url: 'https://www.postcourier.com.pg', category: 'general', language: 'en', country: 'pg' } },
  { url: 'https://www.solomontimes.com/feed/', category: 'general', source: { id: 'stimes', name: 'Solomon Times', url: 'https://www.solomontimes.com', category: 'general', language: 'en', country: 'sb' } },
  { url: 'https://www.dailypost.vu/feed/', category: 'general', source: { id: 'dp', name: 'Daily Post Vanuatu', url: 'https://www.dailypost.vu', category: 'general', language: 'en', country: 'vu' } },
  { url: 'https://www.radionz.co.nz/rss', category: 'general', source: { id: 'rnzi', name: 'RNZ International', url: 'https://www.radionz.co.nz', category: 'general', language: 'en', country: 'nz' } },
  { url: 'https://www.pireport.org/feed/', category: 'general', source: { id: 'pir', name: 'Pacific Islands Report', url: 'https://www.pireport.org', category: 'general', language: 'en', country: 'gu' } },
  { url: 'https://www.islandsbusiness.com/rss', category: 'business', source: { id: 'ib', name: 'Islands Business', url: 'https://www.islandsbusiness.com', category: 'business', language: 'en', country: 'fj' } },
  
  // === TECHNOLOGY ===
  { url: 'https://techcrunch.com/feed/', category: 'technology', source: { id: 'tc', name: 'TechCrunch', url: 'https://techcrunch.com', category: 'technology', language: 'en', country: 'us' } },
  { url: 'https://www.theverge.com/rss/index.xml', category: 'technology', source: { id: 'verge', name: 'The Verge', url: 'https://www.theverge.com', category: 'technology', language: 'en', country: 'us' } },
  { url: 'https://www.wired.com/feed/rss', category: 'technology', source: { id: 'wired', name: 'Wired', url: 'https://www.wired.com', category: 'technology', language: 'en', country: 'us' } },
  { url: 'https://arstechnica.com/feed/', category: 'technology', source: { id: 'ars', name: 'Ars Technica', url: 'https://arstechnica.com', category: 'technology', language: 'en', country: 'us' } },
  { url: 'https://restofworld.org/feed/', category: 'technology', source: { id: 'row', name: 'Rest of World', url: 'https://restofworld.org', category: 'technology', language: 'en', country: 'us' } },
  { url: 'https://www.engadget.com/rss.xml', category: 'technology', source: { id: 'eng', name: 'Engadget', url: 'https://www.engadget.com', category: 'technology', language: 'en', country: 'us' } },
  { url: 'https://www.cnet.com/rss/news/', category: 'technology', source: { id: 'cnet', name: 'CNET', url: 'https://www.cnet.com', category: 'technology', language: 'en', country: 'us' } },
  { url: 'https://www.zdnet.com/rss', category: 'technology', source: { id: 'zd', name: 'ZDNet', url: 'https://www.zdnet.com', category: 'technology', language: 'en', country: 'us' } },
  { url: 'https://venturebeat.com/feed/', category: 'technology', source: { id: 'vb', name: 'VentureBeat', url: 'https://venturebeat.com', category: 'technology', language: 'en', country: 'us' } },
  { url: 'https://www.protocol.com/rss', category: 'technology', source: { id: 'proto', name: 'Protocol', url: 'https://www.protocol.com', category: 'technology', language: 'en', country: 'us' } },
  { url: 'https://www.androidcentral.com/rss', category: 'technology', source: { id: 'ac', name: 'Android Central', url: 'https://www.androidcentral.com', category: 'technology', language: 'en', country: 'us' } },
  { url: 'https://9to5mac.com/feed/', category: 'technology', source: { id: '9to5', name: '9to5Mac', url: 'https://9to5mac.com', category: 'technology', language: 'en', country: 'us' } },
  { url: 'https://www.xda-developers.com/feed/', category: 'technology', source: { id: 'xda', name: 'XDA Developers', url: 'https://www.xda-developers.com', category: 'technology', language: 'en', country: 'us' } },
  { url: 'https://www.anandtech.com/rss', category: 'technology', source: { id: 'anand', name: 'AnandTech', url: 'https://www.anandtech.com', category: 'technology', language: 'en', country: 'us' } },
  { url: 'https://www.theregister.com/headlines.atom', category: 'technology', source: { id: 'reg', name: 'The Register', url: 'https://www.theregister.com', category: 'technology', language: 'en', country: 'gb' } },
  { url: 'https://www.gizmodo.com/rss', category: 'technology', source: { id: 'giz', name: 'Gizmodo', url: 'https://www.gizmodo.com', category: 'technology', language: 'en', country: 'us' } },
  { url: 'https://mashable.com/rss', category: 'technology', source: { id: 'mash', name: 'Mashable', url: 'https://mashable.com', category: 'technology', language: 'en', country: 'us' } },
  { url: 'https://www.digitaltrends.com/rss', category: 'technology', source: { id: 'dtrends', name: 'Digital Trends', url: 'https://www.digitaltrends.com', category: 'technology', language: 'en', country: 'us' } },
  { url: 'https://www.pcmag.com/rss', category: 'technology', source: { id: 'pcmag', name: 'PCMag', url: 'https://www.pcmag.com', category: 'technology', language: 'en', country: 'us' } },
  { url: 'https://www.tomshardware.com/rss', category: 'technology', source: { id: 'tom', name: 'Toms Hardware', url: 'https://www.tomshardware.com', category: 'technology', language: 'en', country: 'us' } },
  
  // === SCIENCE & ENVIRONMENT ===
  { url: 'https://www.nature.com/nature.rss', category: 'science', source: { id: 'nature', name: 'Nature', url: 'https://www.nature.com', category: 'science', language: 'en', country: 'gb' } },
  { url: 'https://www.science.org/rss', category: 'science', source: { id: 'science', name: 'Science', url: 'https://www.science.org', category: 'science', language: 'en', country: 'us' } },
  { url: 'https://www.newscientist.com/feed/', category: 'science', source: { id: 'ns', name: 'New Scientist', url: 'https://www.newscientist.com', category: 'science', language: 'en', country: 'gb' } },
  { url: 'https://www.scientificamerican.com/rss', category: 'science', source: { id: 'sciam', name: 'Scientific American', url: 'https://www.scientificamerican.com', category: 'science', language: 'en', country: 'us' } },
  { url: 'https://www.livescience.com/rss', category: 'science', source: { id: 'ls', name: 'Live Science', url: 'https://www.livescience.com', category: 'science', language: 'en', country: 'us' } },
  { url: 'https://news.mongabay.com/feed/', category: 'environment', source: { id: 'mong', name: 'Mongabay', url: 'https://news.mongabay.com', category: 'environment', language: 'en', country: 'us' } },
  { url: 'https://www.carbonbrief.org/feed/', category: 'environment', source: { id: 'cb', name: 'Carbon Brief', url: 'https://www.carbonbrief.org', category: 'environment', language: 'en', country: 'gb' } },
  { url: 'https://www.climatecentral.org/rss', category: 'environment', source: { id: 'ccent', name: 'Climate Central', url: 'https://www.climatecentral.org', category: 'environment', language: 'en', country: 'us' } },
  { url: 'https://www.ecowatch.com/rss', category: 'environment', source: { id: 'eco', name: 'EcoWatch', url: 'https://www.ecowatch.com', category: 'environment', language: 'en', country: 'us' } },
  { url: 'https://ensia.com/feed/', category: 'environment', source: { id: 'ensia', name: 'Ensia', url: 'https://ensia.com', category: 'environment', language: 'en', country: 'us' } },
  { url: 'https://www.yaleclimateconnections.org/feed/', category: 'environment', source: { id: 'ycc', name: 'Yale Climate Connections', url: 'https://www.yaleclimateconnections.org', category: 'environment', language: 'en', country: 'us' } },
  
  // === HEALTH ===
  { url: 'https://www.who.int/rss-feeds/news-english.xml', category: 'health', source: { id: 'who', name: 'WHO', url: 'https://www.who.int', category: 'health', language: 'en', country: 'ch' } },
  { url: 'https://www.statnews.com/feed/', category: 'health', source: { id: 'stat', name: 'STAT News', url: 'https://www.statnews.com', category: 'health', language: 'en', country: 'us' } },
  { url: 'https://www.medpagetoday.com/rss', category: 'health', source: { id: 'mp', name: 'MedPage Today', url: 'https://www.medpagetoday.com', category: 'health', language: 'en', country: 'us' } },
  { url: 'https://www.sciencedaily.com/rss', category: 'science', source: { id: 'sd', name: 'ScienceDaily', url: 'https://www.sciencedaily.com', category: 'science', language: 'en', country: 'us' } },
  { url: 'https://www.medicalnewstoday.com/rss', category: 'health', source: { id: 'mnt', name: 'Medical News Today', url: 'https://www.medicalnewstoday.com', category: 'health', language: 'en', country: 'gb' } },
  
  // === SPORTS ===
  { url: 'https://www.espn.com/espn/rss/news', category: 'sports', source: { id: 'espn', name: 'ESPN', url: 'https://www.espn.com', category: 'sports', language: 'en', country: 'us' } },
  { url: 'https://www.skysports.com/rss/12040', category: 'sports', source: { id: 'ss', name: 'Sky Sports', url: 'https://www.skysports.com', category: 'sports', language: 'en', country: 'gb' } },
  { url: 'https://www.bbc.co.uk/sport/rss', category: 'sports', source: { id: 'bbcs', name: 'BBC Sport', url: 'https://www.bbc.co.uk/sport', category: 'sports', language: 'en', country: 'gb' } },
  { url: 'https://www.goal.com/en/feeds/news', category: 'sports', source: { id: 'goal', name: 'Goal.com', url: 'https://www.goal.com', category: 'sports', language: 'en', country: 'gb' } },
  { url: 'https://www.transfermarkt.com/rss', category: 'sports', source: { id: 'tm', name: 'Transfermarkt', url: 'https://www.transfermarkt.com', category: 'sports', language: 'en', country: 'de' } },
  
  // === INDEPENDENT & ALTERNATIVE ===
  { url: 'https://globalvoices.org/feed/', category: 'general', source: { id: 'gv', name: 'Global Voices', url: 'https://globalvoices.org', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://www.devex.com/rss', category: 'general', source: { id: 'devex', name: 'Devex', url: 'https://www.devex.com', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://www.opendemocracy.net/en/rss', category: 'general', source: { id: 'od', name: 'Open Democracy', url: 'https://www.opendemocracy.net', category: 'general', language: 'en', country: 'gb' } },
  { url: 'https://www.democracynow.org/rss', category: 'general', source: { id: 'dn', name: 'Democracy Now', url: 'https://www.democracynow.org', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://theintercept.com/feed/', category: 'general', source: { id: 'ti', name: 'The Intercept', url: 'https://theintercept.com', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://www.propublica.org/feeds/propublica/main', category: 'general', source: { id: 'pp', name: 'ProPublica', url: 'https://www.propublica.org', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://www.bellingcat.com/feed/', category: 'general', source: { id: 'bc', name: 'Bellingcat', url: 'https://www.bellingcat.com', category: 'general', language: 'en', country: 'nl' } },
  { url: 'https://www.occrp.org/en/rss', category: 'general', source: { id: 'occrp', name: 'OCCRP', url: 'https://www.occrp.org', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://www.icij.org/feed/', category: 'general', source: { id: 'icij', name: 'ICIJ', url: 'https://www.icij.org', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://www.committee toprotectjournalists.org/rss', category: 'general', source: { id: 'cpj', name: 'CPJ', url: 'https://cpj.org', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://rsf.org/en/rss', category: 'general', source: { id: 'rsf', name: 'Reporters Without Borders', url: 'https://rsf.org', category: 'general', language: 'en', country: 'fr' } },
  { url: 'https://www.hrw.org/news/rss', category: 'general', source: { id: 'hrw', name: 'Human Rights Watch', url: 'https://www.hrw.org', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://www.amnesty.org/en/rss/', category: 'general', source: { id: 'amnesty', name: 'Amnesty International', url: 'https://www.amnesty.org', category: 'general', language: 'en', country: 'gb' } },
  { url: 'https://reliefweb.int/rss', category: 'general', source: { id: 'rw', name: 'ReliefWeb', url: 'https://reliefweb.int', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://www.un.org/rss', category: 'general', source: { id: 'un', name: 'UN News', url: 'https://www.un.org', category: 'general', language: 'en', country: 'us' } },
  { url: 'https://www.worldbank.org/en/rss', category: 'business', source: { id: 'wb', name: 'World Bank', url: 'https://www.worldbank.org', category: 'business', language: 'en', country: 'us' } },
  { url: 'https://www.imf.org/en/rss', category: 'business', source: { id: 'imf', name: 'IMF', url: 'https://www.imf.org', category: 'business', language: 'en', country: 'us' } },
];

// Combine all feeds
export const ALL_RSS_FEEDS = [...GLOBAL_RSS_FEEDS, ...ADDITIONAL_FEEDS];

export class RSSAggregator {
  private feedCache = new Map<string, NewsArticle[]>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async fetchFeed(feed: RSSFeed, limit: number = 10): Promise<NewsArticle[]> {
    const cacheKey = `${feed.source.id}:${limit}`;
    const cached = globalCache.get<NewsArticle[]>(cacheKey);
    if (cached) return cached;

    try {
      const parsed = await rssParser.parseURL(feed.url);
      const articles: NewsArticle[] = [];

      parsed.items?.slice(0, limit).forEach((item, idx) => {
        const article = this.transformRSSItem(item, feed.source, idx);
        if (article) articles.push(article);
      });

      globalCache.set(cacheKey, articles, this.CACHE_TTL);
      return articles;
    } catch (error) {
      console.error(`RSS fetch error for ${feed.source.name}:`, error);
      return [];
    }
  }

  async fetchAllFeeds(category?: string, limitPerFeed: number = 5, maxFeeds: number = 50): Promise<NewsArticle[]> {
    const cacheKey = generateCacheKey('all-rss', { category, limitPerFeed, maxFeeds });
    const cached = globalCache.get<NewsArticle[]>(cacheKey);
    if (cached) return cached;

    let feeds = ALL_RSS_FEEDS;
    if (category && category !== 'general') {
      feeds = feeds.filter(f => f.source.category === category);
    }
    
    // Shuffle and limit feeds for diversity
    feeds = feeds
      .sort(() => Math.random() - 0.5)
      .slice(0, maxFeeds);

    const allArticles: NewsArticle[] = [];

    // Fetch in batches to avoid overwhelming
    const batchSize = 10;
    for (let i = 0; i < feeds.length; i += batchSize) {
      const batch = feeds.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(feed => this.fetchFeed(feed, limitPerFeed))
      );
      
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          allArticles.push(...result.value);
        }
      });
    }

    // Sort by date and deduplicate
    const unique = allArticles
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .filter((article, idx, self) => 
        idx === self.findIndex(a => a.title === article.title)
      );

    globalCache.set(cacheKey, unique, this.CACHE_TTL);
    return unique;
  }

  async fetchByRegion(regionId: string, limit: number = 30): Promise<NewsArticle[]> {
    const cacheKey = `region-rss:${regionId}:${limit}`;
    const cached = globalCache.get<NewsArticle[]>(cacheKey);
    if (cached) return cached;

    const feeds = ALL_RSS_FEEDS.filter(f => {
      // Map countries to regions
      const regionMap: Record<string, string[]> = {
        'asia': ['jp', 'cn', 'in', 'kr', 'id', 'th', 'vn', 'ph', 'my', 'sg', 'bd', 'pk', 'lk', 'np', 'mm', 'mn', 'tw', 'hk', 'kh', 'la', 'bt', 'mv', 'af'],
        'europe': ['gb', 'de', 'fr', 'it', 'es', 'nl', 'be', 'ch', 'at', 'se', 'no', 'dk', 'fi', 'pl', 'cz', 'hu', 'ro', 'bg', 'hr', 'rs', 'ua', 'gr', 'pt', 'ie', 'ru', 'by', 'ee', 'lv', 'lt', 'si', 'ba', 'mk', 'al', 'mt', 'cy', 'is'],
        'africa': ['za', 'ng', 'eg', 'ke', 'et', 'tz', 'ug', 'gh', 'ma', 'dz', 'tn', 'sn', 'ci', 'cm', 'zw', 'zm', 'bw', 'na', 'mz', 'mg', 'rw', 'ss', 'sd', 'ly'],
        'north-america': ['us', 'ca', 'mx', 'cu', 'gt', 'hn', 'sv', 'ni', 'cr', 'pa', 'jm', 'ht', 'do', 'pr'],
        'south-america': ['br', 'ar', 'cl', 'co', 'pe', 've', 'ec', 'bo', 'py', 'uy', 'gy', 'sr', 'gf'],
        'middle-east': ['sa', 'ae', 'qa', 'kw', 'bh', 'om', 'ye', 'iq', 'ir', 'jo', 'lb', 'sy', 'il', 'ps', 'tr', 'cy'],
        'oceania': ['au', 'nz', 'pg', 'fj', 'sb', 'vu', 'nc', 'pf', 'ws', 'to', 'ki', 'tv', 'nr'],
      };
      return regionMap[regionId]?.includes(f.source.country);
    });

    const allArticles: NewsArticle[] = [];
    const results = await Promise.allSettled(
      feeds.slice(0, 20).map(feed => this.fetchFeed(feed, 3))
    );

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allArticles.push(...result.value);
      }
    });

    const unique = allArticles
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .filter((article, idx, self) => 
        idx === self.findIndex(a => a.title === article.title)
      )
      .slice(0, limit);

    globalCache.set(cacheKey, unique, this.CACHE_TTL);
    return unique;
  }

  private transformRSSItem(item: Parser.Item, source: NewsSource, idx: number): NewsArticle | null {
    if (!item.title) return null;

    const title = item.title.trim();
    const description = item.contentSnippet || item.summary || item.content || '';
    
    // Extract image
    let imageUrl = this.extractImageFromRSS(item);
    if (!imageUrl) {
      // Fallback images by category
      const fallbacks: Record<string, string> = {
        'general': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
        'technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
        'business': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
        'sports': 'https://images.unsplash.com/photo-1461896836934- voices-60c9d61d7b31?w=800&q=80',
        'science': 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80',
        'health': 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&q=80',
        'environment': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
      };
      imageUrl = fallbacks[source.category] || fallbacks['general'];
    }

    // Parse date
    let publishedAt = item.isoDate || item.pubDate;
    if (!publishedAt) {
      publishedAt = new Date().toISOString();
    }

    return {
      id: `rss-${source.id}-${idx}-${Date.now()}`,
      title: title,
      description: description.slice(0, 500),
      content: item['content:encoded'] as string || item.content,
      url: item.link || source.url,
      imageUrl: imageUrl,
      source: {
        id: source.id,
        name: source.name,
        url: source.url,
        category: source.category,
        language: source.language,
        country: source.country,
      },
      author: item.creator || item.author || source.name,
      publishedAt: publishedAt,
      category: source.category,
      language: source.language,
      country: source.country,
      keywords: extractKeywords(`${title} ${description}`),
    };
  }

  private extractImageFromRSS(item: Parser.Item): string | null {
    // Try media:content
    const mediaContent = item['media:content'] as { $: { url: string }; url?: string };
    if (mediaContent?.$?.url) return mediaContent.$.url;
    // Try media:thumbnail
    const mediaThumbnail = (item as any)['media:thumbnail'];
    if (mediaThumbnail?.$?.url) return mediaThumbnail.$.url;

    // Try enclosure
    if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
      return item.enclosure.url;
    }

    // Extract from content
    const content = item['content:encoded'] as string || item.content || '';
    const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);
    if (imgMatch) return imgMatch[1];

    return null;
  }
}

export const rssAggregator = new RSSAggregator();
