const client = new Keen({
  projectId: '5337e28273f4bb4499000000',
  readKey: '8827959317a6a01257bbadf16c12eff4bc61a170863ca1dadf9b3718f56bece1ced94552c6f6fcda073de70bf860c622ed5937fcca82d57cff93b432803faed4108d2bca310ca9922d5ef6ea9381267a5bd6fd35895caec69a7e414349257ef43a29ebb764677040d4a80853e11b8a3f'
});

const geoProject = new Keen({
  projectId: '53eab6e12481962467000000',
  readKey: 'd1b97982ce67ad4b411af30e53dd75be6cf610213c35f3bd3dd2ef62eaeac14632164890413e2cc2df2e489da88e87430af43628b0c9e0b2870d0a70580d5f5fe8d9ba2a6d56f9448a3b6f62a5e6cdd1be435c227253fbe3fab27beb0d14f91b710d9a6e657ecf47775281abc17ec455'
});

Keen.ready(function () {

  const navTabs = document.querySelector('.nav-tabs');
  const tabVisitors = document.getElementById('tab-visitors');
  const tabBrowsers = document.getElementById('tab-browsers');
  const tabGeography = document.getElementById('tab-geography');
  let activeRequest;

  const chart_visitors = new KeenDataviz({
    container: '#visitors',
    title: 'Monthly Visits',
    type: 'area'
  });

  const chart_browsers = new KeenDataviz({
    container: '#browser',
    type: 'line'
  });

  const chart_geographies = new KeenDataviz({
    container: '#geography',
    type: 'horizontal-bar'
  });

  navTabs.onclick = setActivePane;
  tabVisitors.onclick = selectVisitorTab;
  tabBrowsers.onclick = selectBrowserTab;
  tabGeography.onclick = selectGeographyTab;
  selectVisitorTab();

  function setActivePane(e) {
    const tabs = this.querySelectorAll('li');
    const tabContent = document.querySelector('.tab-content');
    const activePane = document.querySelector(e.target.hash);

    tabs.forEach(tab => {
      tab.classList.remove('active')
    });
    tabContent.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('active');
    });

    e.target.parentNode.classList.add('active');
    activePane.classList.add('active');
  }

  function selectVisitorTab(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (!chart_visitors.view._rendered) {
      activeRequest = renderVisitorTab(chart_visitors);
    }
  }

  function selectBrowserTab(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (!chart_browsers.view._rendered) {
      activeRequest = renderBrowserTab(chart_browsers);
    }
  }

  function selectGeographyTab(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (!chart_geographies.view._rendered) {
      activeRequest = renderGeographyTab(chart_geographies);
    }
  }

  function renderVisitorTab(chart) {
    return geoProject
      .query('count', {
        event_collection: 'activations',
        interval: 'monthly',
        timeframe: {
          start: '2014-01-01',
          end: '2014-12-01'
        }
      })
      .then(res => {
        chart
          .data(res)
          .render();
      })
      .catch(err => {
        chart
          .message(err.message);
      });
  }

  function renderBrowserTab(chart) {
    return geoProject
      .query('count', {
        event_collection: 'activations',
        group_by: 'device_model_name',
        interval: 'monthly',
        timeframe: {
          start: '2014-01-01',
          end: '2014-12-01'
        }
      })
      .then(res => {
        chart
          .data(res)
          .render();
      })
      .catch(err => {
        chart
          .message(err.message);
      });
  }

  function renderGeographyTab(chart) {
    return client
      .query('count', {
        event_collection: 'visit',
        group_by: 'visitor.geo.province',
        // interval: 'monthly',
        timeframe: {
          start: '2014-01-01',
          end: '2014-12-01'
        }
      })
      .then(res => {
        chart
          .data(res)
          .labelMapping({
            'New Jersey': 'NJ',
            'Virginia': 'VA',
            'California': 'CA',
            'Washington': 'WA',
            'Utah': 'UT',
            'Oregon': 'OR',
            'null': 'Other'
          })
          .sortGroups('desc')
          .render();
      })
      .catch(err => {
        chart
          .message(err.message);
      });
  }




  // ----------------------------------------
  // New Activations
  // ----------------------------------------

  $('.users').knob({
    angleArc: 250,
    angleOffset: -125,
    readOnly: true,
    min: 0,
    max: 500,
    fgColor: '#00bbde',
    height: 290,
    width: '95%'
  });

  geoProject
    .query('count_unique', {
      event_collection: 'activations',
      target_property: 'user.id'
    })
    .then(res => {
      $('.users').val(res.result).trigger('change');
    })
    .catch(err => {
      alert('An error occurred fetching New Activations metric');
    });


  // ----------------------------------------
  // Errors Detected
  // ----------------------------------------

  $('.errors').knob({
    angleArc: 250,
    angleOffset: -125,
    readOnly: true,
    min: 0,
    max: 100,
    fgColor: '#fe6672',
    height: 290,
    width: '95%'
  });

  geoProject
    .query('count', {
      event_collection: 'user_action',
      filters: [{
        property_name: 'error_detected',
        operator: 'eq',
        property_value: true
      }]
    })
    .then(res => {
      $('.errors').val(res.result).trigger('change');
    })
    .catch(err => {
      alert('An error occurred fetching Device Crashes metric');
    });


  // ----------------------------------------
  // Funnel
  // ----------------------------------------

  /*  This funnel is built from mock data */

  const sample_funnel = new KeenDataviz({
      container: '#chart-05',
      type: 'bar',
      colors: ['#00cfbb'],
      labels: ['Purchased Device', 'Activated Device', 'First Session', 'Second Session', 'Invited Friend']
    })
    .data({
      result: [3250, 3000, 2432, 1504, 321]
    })
    .render();

  // ----------------------------------------
  // Mapbox - Active Users
  // ----------------------------------------
  const tframe = {
    start: '2014-01-01',
    end: '2014-02-01'
  };

  const DEFAULTS = {
    coordinates: {
      lat: 37.77350,
      lng: -122.41104
    },
    zoom: 11
  };

  let initialize,
    map,
    markerStart = DEFAULTS.coordinates;

  let activeMapData,
    heat;

  function setActiveButton(button) {
    const classButtonNormal = 'btn btn-default';
    const classButtonSelected = 'btn btn-primary';

    switch (button) {
      default:
      case '7days':
        document.getElementById('7days').className = classButtonSelected;
        document.getElementById('14days').className = classButtonNormal;
        document.getElementById('28days').className = classButtonNormal;
        break;
      case '14days':
        document.getElementById('7days').className = classButtonNormal;
        document.getElementById('14days').className = classButtonSelected;
        document.getElementById('28days').className = classButtonNormal;
        break;
      case '28days':
        document.getElementById('7days').className = classButtonNormal;
        document.getElementById('14days').className = classButtonNormal;
        document.getElementById('28days').className = classButtonSelected;
        break;
    }
  }

  initialize = () => {
    setActiveButton('7days');

    L.mapbox.accessToken = 'pk.eyJ1Ijoia2Vlbi1pbyIsImEiOiIza0xnNXBZIn0.PgzKlxBmYkOq6jBGErpqOg';
    map = L.mapbox.map('map', 'keen-io.kae20cg0', {
      attributionControl: true,
      center: [markerStart.lat, markerStart.lng],
      zoom: DEFAULTS.zoom
    });

    heat = L.heatLayer([], {
      maxZoom: 14
    });

    activeMapData = L.layerGroup().addTo(map);

    map.attributionControl.addAttribution('<a href=\'https://keen.io/\'>Custom Analytics by Keen IO</a>');

    let geoFilter = [];
    geoFilter.push({
      property_name: 'keen.location.coordinates',
      operator: 'within',
      property_value: {
        coordinates: [-122.41104, 37.77350],
        max_distance_miles: 10
      }
    });

    const scoped_events = new Keen.Query('select_unique', {
      event_collection: 'user_action',
      target_property: 'keen.location.coordinates',
      timeframe: tframe,
      filters: geoFilter
    });

    function runQuery() {
      geoProject.run(scoped_events, (err, res) => {
        activeMapData.clearLayers();

        Keen.utils.each(res.result, coord => {
          const em = L.marker(new L.LatLng(coord[1], coord[0]), {
            icon: L.mapbox.marker.icon()
          }).addTo(activeMapData);
        });

        activeMapData.eachLayer(l => {
          heat.addTo(map).addLatLng(l.getLatLng());
        });
        activeMapData.clearLayers();
      });
    }


    let newgeoFilter = [];

    function resize(geo) {

      geo = [];

      heat.setLatLngs([]);

      const center = map.getCenter();
      const zoom = map.getZoom();

      z = zoom - 1;
      if (zoom === 0) {
        radius = false;
      } else {
        radius = 10000 / Math.pow(2, z);
      }

      geo.push({
        property_name: 'keen.location.coordinates',
        operator: 'within',
        property_value: {
          coordinates: [center.lng, center.lat],
          max_distance_miles: radius
        }

      });
      return geo;
    }


    map.on('zoomend', e => {
      newgeoFilter = resize(newgeoFilter);
      scoped_events.set({
        filters: newgeoFilter
      });
      runQuery();
    });
    map.on('dragend', e => {
      newgeoFilter = resize(newgeoFilter);
      scoped_events.set({
        filters: newgeoFilter
      });
      runQuery();
    });



    document.getElementById('14days').addEventListener('click', () => {
      setActiveButton('14days');
      newgeoFilter = resize(newgeoFilter);
      scoped_events.set({
        filters: newgeoFilter,
        timeframe: {
          start: '2014-01-01',
          end: '2014-04-01'
        }
      });
      runQuery();
    });

    document.getElementById('28days').addEventListener('click', () => {
      setActiveButton('28days');
      newgeoFilter = resize(newgeoFilter);
      scoped_events.set({
        filters: newgeoFilter,
        timeframe: {
          start: '2014-01-01',
          end: '2014-12-01'
        }
      });
      runQuery();
    });

    document.getElementById('7days').addEventListener('click', () => {
      setActiveButton('7days');
      newgeoFilter = resize(newgeoFilter);
      scoped_events.set({
        filters: newgeoFilter,
        timeframe: {
          start: '2014-01-01',
          end: '2014-02-01'
        }
      });
      runQuery();
    });

  };




  initialize();
});