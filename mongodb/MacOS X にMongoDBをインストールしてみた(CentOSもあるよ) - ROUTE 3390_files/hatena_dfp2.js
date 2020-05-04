var hatenadfp = hatenadfp || {};
hatenadfp._startTime = new Date().getTime();
hatenadfp.adUnits = hatenadfp.adUnits || [];

var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];

hatenadfp.debug = hatenadfp.debug || false;

hatenadfp.isNGContent = typeof hatenadfp.isNGContent !== 'undefined' ? hatenadfp.isNGContent : function () {
    return false;
};

hatenadfp.enableSingleRequest = hatenadfp.enableSingleRequest || false;

hatenadfp.slotRenderEndedCallback = hatenadfp.slotRenderEndedCallback || function (event) {
    if (hatenadfp.debug || window.location.search.match('hatena_dfp_debug=1')) {
        console.log( 'Slot ' + event.slot.getAdUnitPath() + ' has been rendered in '
            + (new Date().getTime() - hatenadfp._startTime) + ' msec, with' +
            ' size: ' + event.size,
            ' creativeID: ' + event.creativeId +
            ' isEmpty: ' + event.isEmpty +
            ' lineItemId: ' + event.lineItemId +
            ' serviceName: ' + event.serviceName );
    }
};

hatenadfp._hasContentMatch = false;
for (var i = 0; i < hatenadfp.adUnits.length; i++) {
    if (hatenadfp.adUnits[i].allowContentMatch) {
        hatenadfp._hasContentMatch = true;
        break;
    }
}

hatenadfp._addScript = function(url, callback) {
    var script = document.createElement("script");
    script.async = true;
    script.type = "text/javascript";
    script.src = url;
    if (typeof(callback) === 'function') {
        if (script.addEventListener) {
            script.addEventListener('load', callback);
        } else if (script.readyState) {
            script.onreadystatechange = callback;
        }
    }
    var node = document.getElementsByTagName("script")[0];
    node.parentNode.insertBefore(script, node);
};

hatenadfp._extractContent = function() {
    if (hatenadfp._pageText !== undefined) {
        return hatenadfp._pageText;
    }

    var selectors = [
        '#page-keyword div.keyword-body', /* keyword PC */
        '#question-content-container', /* question PC */
        '#hatena-anond div.section',  /* anond PC */
        '#news-container #entry-wrapper', /* bnews PC */
        '#news-container div.top-news', /* bnews PC top */
        '#hatena-www #s-bookmark', /* www top */
        '#hatena-bookmark-touch-index ul.list.entrylist', /* bookmark touch top */
        'div.section.entry-detail', /* bookmark touch entry */
        'div.entry-contents', /* bookmark PC */
        'div#page-content', /* bookmark userpage PC */
        'div#hatena-body div.main', /* bookmark user PC */
        'article div.entry-content', /* blog PC, blog touch */
        'article section.keyword-body', /* keyword touch */
        'div.day div.body div.section', /* diary PC */
        '#container div.section' /* anond touch */
    ];

    var contentNode = document.querySelector(selectors.join(',')) ||
        document.querySelectorAll('div.body div.section')[1] || /* diary touch */
        document.documentElement;

    var text = contentNode.innerHTML;

    text = text.replace(/\s+/g, ' ');
    text = text.replace(/<(script|noscript|style|iframe|select|blockquote|code|pre)[^>]*>.*?<\/\1>/ig, '');
    text = text.replace(/<a[^>]*>https?:\/\/.*?<\/a>/ig, '');
    text = text.replace(/\s*<("[^"]*"|'[^']*'|[^'">])*>\s*/g, '')
    text = text.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) { return String.fromCharCode(s.charCodeAt(0) - 0xFEE0) });

    hatenadfp._pageText = text;

    return text;
};

hatenadfp.displayAdsWithContentMatch = function (config) {
    if (hatenadfp.contentMatchWaitSelector && !document.querySelector(hatenadfp.contentMatchWaitSelector)) {
        (function (config) {
            setTimeout(hatenadfp.displayAdsWithContentMatch, 50, config);
        })(config);
        return;
    }

    var content = hatenadfp._extractContent();

    var scoresOfConfigs = new Array(config.contentMatchConfigs.length);
    for (var i = 0; i < config.contentMatchConfigs.length; i++) {
        var csvKeywordStr = config.contentMatchConfigs[i].keywords;
        csvKeywordStr = csvKeywordStr.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
        });
        csvKeywordStr = csvKeywordStr.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
        var keywords = csvKeywordStr.split(',');
        var validKeywords = [];
        for (var j = 0; j < keywords.length; j++) {
            if(keywords[j].length > 0) {
                validKeywords.push(keywords[j]);
            }
        }
        var regexp = new RegExp('(?:' + validKeywords.join('|') + ')', 'ig');
        scoresOfConfigs[i] = 0;
        while(regexp.exec(content)) {
            scoresOfConfigs[i]++;
        }
    }

    /* 複数のコンテンツマッチ枠がマッチすることを考慮して、得たスコアに応じて確率的に広告を出す */
    var totalScore = 0;
    for (var i = 0; i < scoresOfConfigs.length; i++) {
        totalScore += scoresOfConfigs[i];
    }
    /* キーワードを含まない時に広告をだす場合 */
    /* マッチした場合はscoreを0に、マッチしない場合は平均値をscoreとして与える */
    var avgScore = Math.floor(totalScore / scoresOfConfigs.length);
    if ( avgScore === 0 ) avgScore = 1;
    for (var i = 0; i < scoresOfConfigs.length; i++) {
        if ( !!config.contentMatchConfigs[i].rejects_match ) {
            if ( scoresOfConfigs[i] === 0 ) {
                totalScore += avgScore;
                scoresOfConfigs[i] = avgScore;
            } else {
                totalScore -= scoresOfConfigs[i];
                scoresOfConfigs[i] = 0;
            }
        }
    }

    var targetValue = Math.floor(Math.random() * totalScore);

    var targetConfigIndex;
    var valueRangeStart = 0;
    for (var i = 0; i < scoresOfConfigs.length; i++) {
        if (targetValue >= valueRangeStart && targetValue < valueRangeStart + scoresOfConfigs[i]) {
            targetConfigIndex = i;
            break;
        } else {
            valueRangeStart += scoresOfConfigs[i];
        }
    }

    hatenadfp._contentMatchedUnitName = targetConfigIndex !== undefined
        ? config.contentMatchConfigs[targetConfigIndex].dfp_channel
        : null;

    if (targetConfigIndex !== undefined && config.contentMatchConfigs[targetConfigIndex].div_ids) {
        var targetDivIds = config.contentMatchConfigs[targetConfigIndex].div_ids.split(',');
        if (targetDivIds.length > 0) {
            var targetDivIdMap = {};
            for (var i = 0; i < targetDivIds.length; i++) {
                targetDivIdMap[targetDivIds[i]] = true;
            }
            hatenadfp._contentMatchTargetDivIdMap = targetDivIdMap;
        }
    }

    googletag.cmd.push(hatenadfp.displayAds);
};

hatenadfp.displayAds = function() {
    if (window.location.hostname.indexOf('.dev.hatena.ne.jp') > -1) {
        googletag.pubads().setTargeting('devhost', 'true');
    }
    var targetingKeyValuesMap = {};
    for (var clientName in hatenadfp._clientDfpTargetingKeyNameMap) {
        var internalClientName = clientName === 'fout' ? 'atrae' : clientName;
        var segmentIds = hatenadfp._getSegmentIdsForClient(internalClientName);
        var targetingKey = hatenadfp._clientDfpTargetingKeyNameMap[internalClientName];
        if (targetingKeyValuesMap[targetingKey] === undefined) {
            targetingKeyValuesMap[targetingKey] = [];
        }
        targetingKeyValuesMap[targetingKey].push.apply(targetingKeyValuesMap[targetingKey], segmentIds);
    }
    for (var targetingKey in targetingKeyValuesMap) {
        if (targetingKeyValuesMap[targetingKey].length > 0) {
            googletag.pubads().setTargeting(targetingKey, targetingKeyValuesMap[targetingKey]);
        }
    }
    if (hatenadfp._dgMatchedSegments && hatenadfp._dgMatchedSegments.length > 0) {
        googletag.pubads().setTargeting('dg_segments', hatenadfp._dgMatchedSegments);
    }

    googletag.pubads().addEventListener('slotRenderEnded', hatenadfp.slotRenderEndedCallback);
    if (hatenadfp.enableSingleRequest) {
        googletag.pubads().enableSingleRequest();
    }
    if (hatenadfp.centerAds !== undefined) {
        googletag.pubads().setCentering(hatenadfp.centerAds);
    }
    if (hatenadfp.collapseEmptyDivs) {
        googletag.pubads().collapseEmptyDivs();
    }

    for (var i = 0; i < hatenadfp.adUnits.length; i++) {
        var adUnit = hatenadfp.adUnits[i];
        var adUnitSizes = [];
        var hasFluid;
        /* adUnit.size は [300,250] または [[338,280],[300,250]] あるいは ['fluid', [300,100]] または単に'fluid' のような指定を受け付ける。
           広告がサイズ 'fluid' で表示されるとき、コンテンツマッチが発動しない。(同じページの他の枠は発動しうる)。
           またページコンテンツがのNGときの代替広告指定が効かず、そのまま表示される(なのでテンプレート側で広告の呼び出し自体をしない必要がある)。 */

        if (adUnit.size === 'fluid') {
            hasFluid = true;
        } else if (/_sp_/.test(adUnit.unitName) && typeof(adUnit.size[0]) === 'object') {
            var browserWidth = window.innerWidth;
            for (var j = 0; j < adUnit.size.length; j++) {
                if (typeof(adUnit.size[j]) === 'object' && adUnit.size[j][0] + 20 <= browserWidth) {
                    adUnitSizes.push(adUnit.size[j]);
                } else if (adUnit.size[j] === 'fluid') {
                    hasFluid = true;
                }
            }
        } else {
            adUnitSizes = adUnit.size;
        }
        if (hasFluid) {
            adUnitSizes = adUnit.size;
        } else if (adUnitSizes.length == 0) {
            adUnitSizes = typeof(adUnit.size[0]) === 'object' ? adUnit.size : [adUnit.size];
        }

        if (typeof(hatenadfp.isNGContent) === 'function' ? hatenadfp.isNGContent() : hatenadfp.isNGContent) {
            adUnit.unitName = 'NG';
        } else if (adUnit.allowContentMatch &&
                   hatenadfp._contentMatchedUnitName &&
                   !hasFluid &&
                   (hatenadfp._contentMatchTargetDivIdMap === undefined ||
                    hatenadfp._contentMatchTargetDivIdMap[adUnit.divId])) {
            adUnit.unitName = hatenadfp._contentMatchedUnitName;
        }
        googletag.defineSlot('/4374287/' + adUnit.unitName, adUnitSizes, adUnit.divId).addService(googletag.pubads());

    }

    googletag.enableServices();

    /* ChromeのiOS版において、以下のMutationObserverを使った処理がページロード時の
       フリーズの原因になることがあった。そのため、Android版も含め、スマートフォン・タブレット向けの
       Chromeでは、MutationObserverが存在しても利用せず、これを使用しない処理にフォールバックする。 */
    if (window.MutationObserver && !window.navigator.userAgent.match(/(?:Android.+Chrome|CriOS)/)) {
        var observer = new MutationObserver(function(mutations) {
            var shouldWaitForMoreAdUnits = false;
            for (var i = 0; i < hatenadfp.adUnits.length; i++) {
                var adUnit = hatenadfp.adUnits[i];
                if (!adUnit.displayed) {
                    if (document.getElementById(adUnit.divId)) {
                        googletag.display(adUnit.divId);
                        adUnit.displayed = true;
                    } else {
                        shouldWaitForMoreAdUnits = true;
                    }
                }
            }
            if (!shouldWaitForMoreAdUnits) {
                observer.disconnect();
            }
        });
        observer.observe(document, { childList: true, subtree: true });
    } else {
        googletag.cmd.push(function() {
            for (var i = 0; i < hatenadfp.adUnits.length; i++) {
                (function(adUnit) {
                    if (document.getElementById(adUnit.divId)) {
                        googletag.display(adUnit.divId);
                    } else {
                        hatenadfp._onPageLoadComplete(function () {
                            googletag.display(adUnit.divId);
                        });
                    }
                })(hatenadfp.adUnits[i]);
            }
        });
    }
};

hatenadfp._onPageLoadComplete = function (func) {
    if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', function() {
            func();
        }, false);
    } else if (document.attachEvent) {
        document.attachEvent('onload', function() {
            func();
        });
    }
};

hatenadfp.getCookie = function (key) {
  var counter, _key, _val, cookies = document.cookie.split(";");
  for (counter = 0; counter < cookies.length; counter++) {
    if (_key = cookies[counter].substr(0, cookies[counter].indexOf("=")),
    _val = cookies[counter].substr(cookies[counter].indexOf("=") + 1),
    _key = _key.replace(/^\s+|\s+$/g, ""),
    _key === key) return unescape(_val);
  }
};

hatenadfp.setCookie = function(key, value, expire) {
    var d = new Date();
    d.setDate(d.getDate() + expire);
    value = escape(value) + "; domain=.hatena.ne.jp; path=/" + (null === expire ? "" : "; expires=" + d.toUTCString());
    document.cookie = key + "=" + value;
};

hatenadfp._getSyncSegmentIds = function () {
    var cookieEntryStr = hatenadfp.getCookie("_fout_segment");
    return cookieEntryStr !== undefined ? cookieEntryStr.split(",") : [];
};

hatenadfp._getAllSegmentIds = function () {
    var segmentIds = [];
    ['_fout_segment', '_nttcom_segment', '_vsn_segment', '_cri_segment', '_bsa_segment',
     '_recruit_birth_segment', '_recruit_startup_segment', '_recruit_it_segment'].forEach(function(key) {
        var cookieEntryStr = hatenadfp.getCookie(key);
        if (cookieEntryStr === undefined) return;
        segmentIds = segmentIds.concat(cookieEntryStr.split(","));
    });
    return segmentIds;
};
hatenadfp._getSegmentIdsForClient = function (clientName) {
    var segmentIds = [];
    if (clientName === 'atrae') {
        clientName = 'fout';
    }
    var cookieEntryStr = hatenadfp.getCookie('_' + clientName + '_segment');
    if (cookieEntryStr === undefined) return;
    segmentIds = segmentIds.concat(cookieEntryStr.split(","));
    return segmentIds;
};

hatenadfp._keywordSegmentIdMap = {
    'atrae': {
        'java': 83206,
        'ruby': 83207,
        'php': 83208,
        'perl': 83209,
        'objective-c': 83210,
        'javascript': 83211,
        'html5': 83212,
        'ios': 83213,
        'iphone': 83214,
        'android': 83215,
        'oracle': 83216,
        'mysql': 83217,
        'インフラ': 83218,
        'クラウド': 83219,
        'プログラミング': 83220
    },
    'nttcom': {
        'アプリ開発': 36000,
        'object-c': 36000,
        'java': 36000,
        'java ee': 36000,
        'asp.net mvc': 36000,
        'ruby on rails': 36000,
        'php': 36000,
        'struts': 36000,
        'play': 36000,
        'node.js': 36000,
        '.net': 36000,
        'perl': 36000,
        'c#': 36000,
        'python': 36000,
        'c++': 36000,
        'c+': 36000,
        'ruby': 36000,
        'objective-C': 36000,
        'javascript': 36000,
        'coffeescript': 36000,
        'mysql': 36000,
        'プログラミング': 36000,
        'エンジニア': 36000
    },
    'vsn': {
        'java': 37000,
        'ruby': 37000,
        'php': 37000,
        'perl': 37000,
        'objective-C': 37000,
        'javascript': 37000,
        'html5': 37000,
        'ios': 37000,
        'iphone': 37000,
        'android': 37000,
        'oracle': 37000,
        'mySQL': 37000,
        'インフラ': 37000,
        'クラウド': 37000,
        'プログラミング': 37000,
        'cad': 37000,
        'cobol': 37000,
        'cr5000': 37000,
        'dbms': 37000,
        'fpga': 37000,
        'http': 37000,
        'lsiレイアウト': 37000,
        'mcframe': 37000,
        'oracleebs': 37000,
        'pcb処理': 37000,
        'plcプログラム': 37000,
        'verilog': 37000
    },
    'cri': {
        '求人': 38000,
        '求人サイト': 38001,
        '転職': 38002,
        '転職サイト': 38003,
        '正社員': 38004,
        '契約社員': 38005,
        'フリーランス': 38006,
        '求人情報': 38007,
        'デザイナー求人': 38008,
        'デザイナー転職': 38009,
        'webデザイナー求人': 38010,
        'webデザイナー転職': 38011,
        'web業界求人': 38012,
        'web業界転職': 38013,
        'ウェブ制作会社': 38014,
        'web制作会社': 38015,
        'ウェブデザイナー': 38016,
        'webデザイナー': 38017,
        'ウェブ業界': 38018,
        'web業界': 38019,
        'ウェブサイトデザイン': 38020,
        'webサイトデザイン': 38021,
        'モバイル業界': 38022,
        'ウェブディレクター': 38023,
        'webディレクター': 38024,
        'インフォメーションアーキテクト': 38025,
        'uxデザイナー': 38026,
        'uiデザイナー': 38027,
        'ux・uiデザイナー': 38028,
        'htmlコーダー': 38029,
        'コーダー': 38030,
        'webマーケティング': 38031,
        'ウェブマーケティング': 38032,
        'デザイン事務所': 38033
    }
};

hatenadfp._clientDfpTargetingKeyNameMap = {
    'atrae': 'IT',
    'nttcom': 'IT',
    'vsn': 'IT',
    'cri': '求人'
};

hatenadfp._keywordAdwordsRemarketingLabelMap = {
    'java': '0dMtCK_shFoQpYfa_gM',
    'php': 'ZJzoCPra_VkQpYfa_gM',
    'perl': 'nAt_COWYgloQpYfa_gM',
    'python': 'o1zYCP3a_VkQpYfa_gM',
    'ruby': 'fQutCKzlg1oQpYfa_gM',
    'objective-c': 'MNBcCITZ-lkQpYfa_gM',
    'javascript': 'NYwLCNj_g1oQpYfa_gM',
    'c#': 'hnXhCNv_g1oQpYfa_gM',
    'mysql': 'a1LHCMmZgVoQpYfa_gM',
    'プログラミング': 'nX_aCN7_g1oQpYfa_gM',
    'エンジニア': 'wPvCCNmAgloQpYfa_gM',
    '独立': 'vL5gCKeygFoQpYfa_gM',
    '起業': 'HCpLCOH_g1oQpYfa_gM',
    'フリーランス': 'LZPbCOT_g1oQpYfa_gM'
};

hatenadfp._intimateMergerKeywords = [ 'JavaScript', 'Linux', 'Android', 'Java', 'PHP', 'Ruby', 'Python', 'iOS', 'CSS', 'Mac', 'HTML', 'CentOS', 'jQuery', 'Git', 'MySQL', 'Ubuntu', 'C#', 'Rails', 'Twitter', 'Node.js', 'C\\+\\+', 'Swift', 'Xcode', 'GitHub', 'Objective-C', 'ShellScript', 'HTML5', 'iPhone', 'Vim', 'MacOSX', 'Apache', 'CSS3', 'SSH', 'nginx', 'Chrome', 'C', '正規表現', 'Zsh', 'Scala', 'Perl', 'Qiita', 'CoffeeScript', 'Heroku', 'Emacs', 'MongoDB', 'Facebook', 'Haskell', 'TDD', 'Backbone.js', 'Scheme', '英語', '転職', '自動車', '資格' ];

hatenadfp._synDotPMPTagKeywordsMap = {
    'cars': [ '自動車', 'コンパクトカー', 'クーペ', 'ハッチバック', 'ミニバン1ボックス', 'オープンカー', 'SUV', 'セダン', 'スポーツカー', 'ワゴン', 'スポーツカー', '国産車', 'ダイハツ', '本田技研', 'マツダ', '日産', 'スバル', 'スズキ', 'トヨタ', '輸入車', 'アルファロメオ', 'BMW', 'アウディ', 'ベンツ', 'シボレー', 'クライスラー', 'フィアット', 'タイヤ', '中古車', 'エコカー', '新車' ],
    'jobs': [ '求人', '転職', 'インターン', '派遣', '新卒', '中途', '採用', '年収', 'リクナビ', 'マイナビ', '契約社員', 'ブラック企業', 'ホワイト企業', 'キャリア', '退職', 'career', 'フリーランス', '面接', '入社' ],
    'finance': [ 'ファイナンス', '銀行', 'インターネット銀行', 'クレジットカード', '保険', '投資', 'マネー', '為替', '投資信託', 'ニーサ', 'NISA', '株', 'ローン', '年金', '税金', 'FX', '金融', '貯金', '貯蓄' ],
    'cosme': [ '化粧品', '美容液', 'リップケア', '化粧水', '乳液', 'パック', 'しわ', '毛穴', '美白', 'ホワイトニング', '香水', 'ヘアケア', 'ボディケア', 'コスメ', 'メイクアップ', '化粧下地', 'チーク', 'コンシーラー', 'アイブロウ', 'アイライナー', 'アイシャドウ', 'ファンデーション', '口紅', 'リップグロス', 'マスカラ', 'ネイル', 'パウダー', 'スキンケア', 'クレンジング' ],
    'entertainment': [ 'エンタメ', 'エンターテインメント', '映画', 'アニメ', '漫画', 'マンガ', 'ゲーム', '小説', '演劇', '音楽', 'バンド', 'テレビ', 'ラジオ', '番組', '放送', '芸能', 'TV', 'ドラマ', 'お笑い', 'ジャニーズ', 'アイドル', '声優', 'VOD' ],
    'realestate': [ '不動産', '戸建', 'マンション', '新築', '物件', '賃貸', 'リフォーム', 'リノベーション', '土地', '引っ越し', '住宅', '入居', '分譲', 'マイホーム', 'ホームズ', 'スーモ', 'SUUMO', 'マイナビ賃貸', 'アットホーム', 'アパート' ],
    'tech': [ 'Java', 'PHP', 'システム開発', 'アプリ開発', 'インフラエンジニア', 'ITエンジニア', '社内SE', 'コーディング', 'Webシステム', 'JavaScript', 'Objective-C', '業務システム', 'フロントエンド', 'オブジェクト指向', 'C++', 'Perl', 'C#', 'HTML', 'SQL', 'Linux' ],
    'gadget': [ 'ガジェット', 'iPhone', 'Android', 'タブレット', 'Kindle', 'gadget', 'スマホ', 'デジタルカメラ', 'スマートフォン', 'スマートウォッチ' ],
    'travel': [ '旅行', '海外', 'パスポート', 'ホテル', '旅館', '温泉', 'お土産', '観光', '散策', '女子旅', 'travel', 'trip' ],
    'cooking': [ '料理', 'レシピ', 'レンジ', 'オーブン', '弁当', 'カロリー', 'おかず', '食材', 'フライパン' ],
    'childcare': [ '育児', '赤ちゃん', '絵本', '出産', '妊娠', '育メン', '子育て', '保育', '幼稚園', '児童', '妊婦', '乳児', '幼児' ]
}

hatenadfp._addSegmentsByKeywords = function (matchedKeywords) {
    var userSegmentIds = hatenadfp._getAllSegmentIds();
    var userSegmentIdMap = {};
    for (var i = 0; i < userSegmentIds.length; i++) {
        userSegmentIdMap[userSegmentIds[i]] = true;
    }
    for (var i = 0; i < matchedKeywords.length; i++) {
        for (var key in hatenadfp._keywordSegmentIdMap) {
            var matchedSegmentId = hatenadfp._keywordSegmentIdMap[key][matchedKeywords[i]];
            if (matchedSegmentId && userSegmentIdMap[matchedSegmentId] === undefined) {
                hatenadfp._addScript('//b.hatena.ne.jp/api/internal/v0/user.segment.json?keywords_csv=' + encodeURIComponent(matchedKeywords.join(',')));
                return;
            }
        }
    }
};

hatenadfp._assignAdTargetingSegments = function() {
    var text = hatenadfp._extractContent();

    var keywords = [];
    for (var key in hatenadfp._keywordSegmentIdMap) {
        for (var keyword in hatenadfp._keywordSegmentIdMap[key]) {
            keywords.push(hatenadfp._escapeStr(keyword));
        }
    }

    var keywordRegExp = new RegExp('(' + keywords.join('|') + ')', 'ig');
    var matched = keywordRegExp.exec(text);
    var matchedKeywordMap = {};
    while(matched) {
        matchedKeywordMap[matched[0].toLowerCase()] = true;
        matched = keywordRegExp.exec(text);
    }
    var matchedKeywords = [];
    for (var keyword in matchedKeywordMap) {
        matchedKeywords.push(keyword);
    }

    if (matchedKeywords.length > 0) {
        hatenadfp._addSegmentsByKeywords(matchedKeywords);
    }

    /* Google Adwords Remarketing */
    var adwordsKeywords = [];
    for (var adwordsKeyword in hatenadfp._keywordAdwordsRemarketingLabelMap) {
        adwordsKeywords.push(hatenadfp._escapeStr(adwordsKeyword));
    }
    var adwordsKeywordRegExp = new RegExp('(' + adwordsKeywords.join('|') + ')', 'ig');
    var adwordsMatched = adwordsKeywordRegExp.exec(text);
    var adwordsMatchedKeywordMap = {};
    while (adwordsMatched) {
        adwordsMatchedKeywordMap[adwordsMatched[0].toLowerCase()] = true;
        adwordsMatched = adwordsKeywordRegExp.exec(text);
    }
    if (Object.keys(adwordsMatchedKeywordMap).length > 0) {
        for (var adwordsKeyword in adwordsMatchedKeywordMap) {
            var conversionLabel = hatenadfp._keywordAdwordsRemarketingLabelMap[adwordsKeyword];
            if (conversionLabel) {
                (new Image()).src = '//googleads.g.doubleclick.net/pagead/viewthroughconversion/1071023013/?value=1.00&currency_code=JPY&label=' + conversionLabel + '&guid=ON&script=0'
            }
        }
    }

    /* BigMining / keyword segmentation */
    hatenadfp.imKeywords = [];
    var imKeywordRegExp = new RegExp('(' + hatenadfp._intimateMergerKeywords.join('|') + ')', 'ig');
    var imMatchedKeywordMap = {};
    var imKeywordsMatched = imKeywordRegExp.exec(text);
    while (imKeywordsMatched) {
        imMatchedKeywordMap[imKeywordsMatched[0].toLowerCase()] = true;
        imKeywordsMatched = imKeywordRegExp.exec(text);
    }
    if (Object.keys(imMatchedKeywordMap).length > 0) {
        for (var imMatchedKeyword in imMatchedKeywordMap) {
            hatenadfp.imKeywords.push(imMatchedKeyword);
        }
        hatenadfp._addScript('//cdn.bigmining.com/private/js/hatena_bigmining.js');
    }

    /* Syn.PMP keyword segmentation */
    for (var tag in hatenadfp._synDotPMPTagKeywordsMap) {
        var escapedKeywords = [];
        for (var i = 0; i < hatenadfp._synDotPMPTagKeywordsMap[tag].length; i++) {
            escapedKeywords.push(hatenadfp._escapeStr(hatenadfp._synDotPMPTagKeywordsMap[tag][i]));
        }
        var synDotKeywordRegExp = new RegExp('(' + escapedKeywords.join('|') + ')', 'ig');
        if (synDotKeywordRegExp.test(text)) {
            hatenadfp._addScript('//i.socdm.com/s/so_dmp.js?service_id=synmp_hatena_' + tag);
        }
    }

    /* Intimate Merger / Hatnea login user segmentation */
    if (hatenadfp.getCookie('rk')) {
        (new Image()).src = '//atm.im-apps.net/a/beacon.gif?cid=6604&c1=1';
    }
};

hatenadfp._escapeStr = function(str) {
    return str.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + '-]', 'g'), '\\$&');
};

hatenadfp._effectiveSegmentIdMap = {
    '3014': true,
    '3008': true,
    '13128': true,
    '10184': true
};

hatenadfp.presetDGSegments = function (data) {
    var segment_list = ["flzQBBzN2LI","+DgeiKxAJZk","a0l5Sjl3U64","gRTQXn9P4ts","WKeMVLxRFv4","ZcTCjTDj4F4","HeVyp8KHt9o","LGGVZUjS2Ho","IY1BMneJRrI","rzm7Hcl7mkk","UQWWkMyAOBc","JWDQFIRkyIA","n2AyesozhX4","DCPpBaiImbY","WKBn3fpj6OM","FFNd9Dk2QAg","EdpzakAtbXs","e/bCFyDhM2k","XVuxPrdCKoQ","/CdoGlkNCCM","dJIawCdqVNI","DS6qkQc/Xiw","W1/PY9mokFM","juN1q7CibZk","2Ud0dAa/Ypw","FdtNZrh0fXk","cZCAudtUf7E","okFGZfQS+9o","nvXtM/AiVYI","Mz6Z+VjaMjU","PdG0vbY0Eos","SQqURn0TlY4","BHMNVmDFGmk","NQyUoxNt1Uk","u4filJogmtY","UfOXoHC4p1o","vuv8vFjLJnk","ujXUdyD8350","s045hPTiAfQ","a4agivnpv78","Ww7vvNR8TQw","fDNurMqFi4c","l5RZQKuh8DE","GGIpcsm2JRM","P7DXf92MdgA","HxuAzYgAXJ0","1U9UZ6fa3cg","QW7r5RzfzoQ","1k1Pp2Le+1Y","r/zJLPXILts","aIasJwXRQnY"];
    var req_segment_list = [];
    for (var key in data.segment_eids) {
        if(segment_list.indexOf(data.segment_eids[key]) >= 0){
            req_segment_list.push(data.segment_eids[key]);
        }
    }
    hatenadfp._dgMatchedSegments = req_segment_list;
    hatenadfp.displayAdsMayContentMatch();

}

hatenadfp.displayAdsMayContentMatch = function () {
    if (hatenadfp._hasContentMatch) {
        hatenadfp._addScript('//b.hatena.ne.jp/api/dfp.config.json?callback=hatenadfp.displayAdsWithContentMatch');
    } else if (!hatenadfp._dgMatchedSegments) {
        hatenadfp._addScript('//sync.im-apps.net/imid/segment?token=E38WhJfqkeUxiIkb8Mzm7Q&callback=hatenadfp.presetDGSegments');
    } else {
        googletag.cmd.push(hatenadfp.displayAds);
    }
}

hatenadfp.displayAdsWithSegmentSync = function(segmentData) {
    var segmentIds = hatenadfp._getSyncSegmentIds();
    var segmentIdMap = {};
    for (var i = 0; i < segmentIds.length; i++) {
        segmentIdMap[segmentIds[i]] = true;
    }
    if(segmentData.segments !== undefined) {
        for (var j = 0; j < segmentData.segments.length; j++) {
            if (hatenadfp._effectiveSegmentIdMap[segmentData.segments[j].segment_id]) {
                segmentIdMap[segmentData.segments[j].segment_id] = true;
            }
        }
    }
    var mergedSegmentIds = [];
    for (var segmentId in segmentIdMap) {
        mergedSegmentIds.push(segmentId);
    }

    hatenadfp.setCookie('_fout_segment', mergedSegmentIds.join(','), 365);
    hatenadfp.setCookie('_fout_segment_sync', '1', 1);

    hatenadfp.displayAdsMayContentMatch();
};

hatenadfp._addScript('//hatena-d.openx.net/w/1.0/jstag?nc=4374287-hatena.ne.jp');
hatenadfp._addScript('//c.amazon-adsystem.com/aax2/amzn_ads.js', function () {
    amznads.doGetAdsAsync('3466', null, null, function () {
        amznads.setTargetingForGPTAsync('amznslots');
    })
});

if (!hatenadfp.getCookie('_fout_segment_sync')) {
    hatenadfp._addScript('//cnt.fout.jp/segapi/audience?cvid=mstR6EjxHmpIV1QDzg&callback=hatenadfp.displayAdsWithSegmentSync');
} else {
    hatenadfp.displayAdsMayContentMatch();
}

hatenadfp._addScript('//www.googletagservices.com/tag/js/gpt.js');

hatenadfp._onPageLoadComplete(hatenadfp._assignAdTargetingSegments);
