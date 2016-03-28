module.exports = function get_available_filters(viz, params){

  viz.possible_filters = {};
  viz.filter_data = {};

  var views = params.network_data.views;

  _.each(views, function(inst_view){
    var inst_keys = _.keys(inst_view);

    _.each(inst_keys, function(inst_key){

      if (inst_key != 'nodes'){

        if (!_.has(viz.filter_data, inst_key)){
          viz.filter_data[inst_key] = [];
        }

        viz.filter_data[inst_key].push(inst_view[inst_key]);

        viz.filter_data[inst_key] = _.unique( viz.filter_data[inst_key] );

      }

    });

  });

  var tmp_filters = _.keys(viz.filter_data);
  
  _.each( tmp_filters, function(inst_filter){
     
    var options = viz.filter_data[inst_filter];
    var num_options = options.length; 

    var filter_type = 'categorical';
    _.each(options, function(inst_option){
      if (typeof inst_option === 'number'){
        filter_type = 'numerical';
      }
    });

    if (num_options > 1){
      viz.possible_filters[inst_filter] = filter_type;
    }

  });

  return viz;
  
};