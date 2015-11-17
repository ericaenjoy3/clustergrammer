
function Matrix(network_data, svg_elem, params) {

  var matrix = [],
  row_nodes = network_data.row_nodes,
  col_nodes = network_data.col_nodes,
  clust_group;

  var row_nodes_names = _.pluck(row_nodes, 'name');
  var col_nodes_names = _.pluck(col_nodes, 'name');

  // append a group that will hold clust_group and position it once
  clust_group = svg_elem
    .append('g')
    .attr('transform', 'translate(' +
      params.viz.clust.margin.left + ',' +
      params.viz.clust.margin.top + ')')
    .append('g')
    .attr('id', 'clust_group');

  // clustergram background rect
  clust_group
    .append('rect')
    .attr('class', 'background')
    .attr('id', 'grey_background')
    .style('fill', '#eee')
    .attr('width', params.viz.clust.dim.width)
    .attr('height', params.viz.clust.dim.height);

  var tile_data = _.filter(network_data.links, 
    function(num) {
      return num.value !== 0 || num.highlight !== 0;
    });


  console.log('making row tiles')
  
  // make row matrix - add key names to rows in matrix 
  var row_groups = clust_group.selectAll('.row')
    .data(params.matrix.matrix, function(d){return d.name;})
    .enter()
    .append('g')
    .attr('class', 'row')
    .attr('transform', function(d) {
      var tmp_index = _.indexOf(row_nodes_names, d.name);
      return 'translate(0,' + params.matrix.y_scale(tmp_index) + ')';
    });



  // add group rows later 
  row_groups = row_groups.each(draw_simple_rows);

  // // draw rows of clustergram
  // if (params.matrix.tile_type === 'simple') {
  //   row_groups = row_groups.each(draw_simple_rows);
  // } else {
  //   row_groups = row_groups.each(draw_group_rows);
  // };


  // // draw rows or individual tiles 
  // if (params.matrix.tile_type === 'simple') {

  //   if (params.network_data.links.length < params.matrix.def_large_matrix){
  //     console.log('making simple tiles');
  //     draw_simple_tiles(clust_group, tile_data);
  //   } else {

  //     console.log('making row tiles')

  //     // make row matrix 
  //     var row_groups = clust_group.selectAll('.row')
  //       .data(params.matrix.matrix, function(d){return d.name;})
  //       .enter()
  //       .append('g')
  //       .attr('class', 'row')
  //       .attr('transform', function(d, index) {
  //         return 'translate(0,' + params.matrix.y_scale(index) + ')';
  //       });

  //     // draw rows of clustergram
  //     if (params.matrix.tile_type === 'simple') {
  //       row_groups = row_groups.each(draw_simple_rows);
  //     } else {
  //       row_groups = row_groups.each(draw_group_rows);
  //     }

  //   }

  // } 
  // else {
  //   console.log('making group tiles');
  //   draw_group_tiles(clust_group, tile_data);    
  // }

  // add callback function to tile group - if one is supplied by the user
  if (typeof params.click_tile === 'function') {
    d3.selectAll('.tile')
    .on('click', function(d) {
      // export row/col name and value from tile
      var tile_info = {};
      tile_info.row = params.network_data.row_nodes[d.pos_y].name;
      tile_info.col = params.network_data.col_nodes[d.pos_x].name;
      tile_info.value = d.value;
      if (Utils.has(d, 'value_up')) {
      tile_info.value_up = d.value_up;
      }
      if (Utils.has(d, 'value_dn')) {
      tile_info.value_dn = d.value_dn;
      }
      if (Utils.has(d, 'info')) {
      tile_info.info = d.info;
      }
      // run the user supplied callback function
      params.click_tile(tile_info);
      add_click_hlight(this);
    });
  } else {

    // highlight clicked tile
    if (params.tile_click_hlight){
      d3.selectAll('.tile')
        .on('click',function(d){
          add_click_hlight(this)
        })
    }

  }


  function add_click_hlight(clicked_rect){

    // get x position of rectangle
    d3.select(clicked_rect).each(function(d){
      var pos_x = d.pos_x;
      var pos_y = d.pos_y;

      d3.selectAll('.click_hlight')
        .remove();

      if (pos_x!=params.matrix.click_hlight_x || pos_y!=params.matrix.click_hlight_y){

        // save pos_x to params.viz.click_hlight_x
        params.matrix.click_hlight_x = pos_x;
        params.matrix.click_hlight_y = pos_y;

        // draw the highlighting rectangle as four rectangles
        // so that the width and height can be controlled
        // separately

        var rel_width_hlight = 6;
        var opacity_hlight = 0.85;

        var hlight_width  = rel_width_hlight*params.viz.border_width;
        var hlight_height = rel_width_hlight*params.viz.border_width/params.viz.zoom_switch;

        // top highlight
        d3.select(clicked_rect.parentNode)
          .append('rect')
          .attr('class','click_hlight')
          .attr('id','top_hlight')
          .attr('width', params.matrix.x_scale.rangeBand())
          .attr('height', hlight_height)
          .attr('fill',params.matrix.hlight_color)
          .attr('transform', function() {
            return 'translate(' + params.matrix.x_scale(pos_x) + ',0)';
          })
          .attr('opacity',opacity_hlight);

        // left highlight
        d3.select(clicked_rect.parentNode)
          .append('rect')
          .attr('class','click_hlight')
          .attr('id','left_hlight')
          .attr('width', hlight_width)
          .attr('height', params.matrix.y_scale.rangeBand() - hlight_height*0.99 )
          .attr('fill',params.matrix.hlight_color)
          .attr('transform', function() {
            return 'translate(' + params.matrix.x_scale(pos_x) + ','+
              hlight_height*0.99+')';
          })
          .attr('opacity',opacity_hlight);

        // right highlight
        d3.select(clicked_rect.parentNode)
          .append('rect')
          .attr('class','click_hlight')
          .attr('id','right_hlight')
          .attr('width', hlight_width)
          .attr('height', params.matrix.y_scale.rangeBand() - hlight_height*0.99 )
          .attr('fill',params.matrix.hlight_color)
          .attr('transform', function() {
            var tmp_translate = params.matrix.x_scale(pos_x) + params.matrix.x_scale.rangeBand() - hlight_width;
            return 'translate(' + tmp_translate + ','+
              hlight_height*0.99+')';
          })
          .attr('opacity',opacity_hlight);

        // bottom highlight
        d3.select(clicked_rect.parentNode)
          .append('rect')
          .attr('class','click_hlight')
          .attr('id','bottom_hlight')
          .attr('width', function(){
            return params.matrix.x_scale.rangeBand() - 1.98*hlight_width})
          .attr('height', hlight_height)
          .attr('fill',params.matrix.hlight_color)
          .attr('transform', function() {
            var tmp_translate_x = params.matrix.x_scale(pos_x) + hlight_width*0.99;
            var tmp_translate_y = params.matrix.y_scale.rangeBand() - hlight_height;
            return 'translate(' + tmp_translate_x + ','+
              tmp_translate_y+')';
          })
          .attr('opacity',opacity_hlight);

        } else {
          params.matrix.click_hlight_x = -666;
          params.matrix.click_hlight_y = -666;
        }


    })
  }

  // draw grid lines after drawing tiles
  draw_grid_lines(row_nodes, col_nodes);

  // make each row in the clustergram
  function draw_simple_rows(ini_inp_row_data) {

    var inp_row_data = ini_inp_row_data.row_data;

    // remove zero values to make visualization faster
    var row_data = _.filter(inp_row_data, function(num) {
      return num.value !== 0;
    });

    // generate tiles in the current row
    var tile = d3.select(this)
      .selectAll('rect')
      .data(row_data, function(d){return d.col_name;})
      .enter()
      .append('rect')
      .attr('class', 'tile row_tile')
      .attr('width', params.matrix.rect_width)
      .attr('height', params.matrix.rect_height)
      // switch the color based on up/dn value
      .style('fill', function(d) {
        return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
      })
      .on('mouseover', function(p) {
        // highlight row - set text to active if
        d3.selectAll('.row_label_text text')
          .classed('active', function(d, i) {
            return i === p.pos_y;
          });

        d3.selectAll('.col_label_text text')
          .classed('active', function(d, i) {
            return i === p.pos_x;
          });
      })
      .on('mouseout', function mouseout() {
        d3.selectAll('text').classed('active', false);
      })
      .attr('title', function(d) {
        return d.value;
      });

    tile
      .style('fill-opacity', function(d) {
        // calculate output opacity using the opacity scale
        var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
        return output_opacity;
      });

    tile
      .attr('transform', function(d) {
        var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width; 
        var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
        return 'translate(' + x_pos + ','+y_pos+')';
      });

    // append title to group
    if (params.matrix.tile_title) {
      tile.append('title')
      .text(function(d) {
        var inst_string = 'value: ' + d.value;
        return inst_string;
      });
    }

  }

  function draw_simple_tiles(clust_group, tile_data){

    // bind tile_data 
    var tile = clust_group.selectAll('.tile')
      .data(tile_data, function(d){return d.name;})
      .enter()
      .append('rect')
      .attr('class','tile')
      .attr('width', params.matrix.rect_width)
      .attr('height', params.matrix.rect_height)
      // switch the color based on up/dn value
      .style('fill', function(d) {
        return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
      })
      .on('mouseover', function(p) {
        var row_name = p.name.split('_')[0];
        var col_name = p.name.split('_')[1];

        // highlight row - set text to active if
        d3.selectAll('.row_label_text text')
          .classed('active', function(d) {
            return row_name === d.name;
          });

        d3.selectAll('.col_label_text text')
          .classed('active', function(d) {
            return col_name === d.name;
          });
      })
      .on('mouseout', function mouseout() {
        d3.selectAll('text').classed('active', false);
      })
      .attr('title', function(d) {
        return d.value;
      });

    tile
      .style('fill-opacity', function(d) {
        // calculate output opacity using the opacity scale
        var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
        return output_opacity;
      });

    tile
      .attr('transform', function(d) {
        var x_pos = params.matrix.x_scale(d.target) + 0.5*params.viz.border_width;
        var y_pos = params.matrix.y_scale(d.source) + 0.5*params.viz.border_width/params.viz.zoom_switch;
        return 'translate(' + x_pos + ','+ y_pos +')';
      });

    // append title to group
    if (params.matrix.tile_title) {
      tile.append('title')
        .text(function(d) {
          var inst_string = 'value: ' + d.value;
          return inst_string;
        });
    }

  }

  // make each row in the clustergram
  function draw_group_tiles(clust_group, tile_data) {

    // bind tile_data
    var tile = clust_group
      .selectAll('g')
      .data(tile_data, function(d){ return d.name;})
      .enter()
      .append('g')
      .attr('class', 'tile')
      .attr('transform', function(d) {
        return 'translate(' + params.matrix.x_scale(d.target) + ','+params.matrix.y_scale(d.source)+')';
      });

    // append rect
    tile
      .append('rect')
      .attr('class','tile_group')
      .attr('width', params.matrix.x_scale.rangeBand())
      .attr('height', params.matrix.y_scale.rangeBand())
      .style('fill-opacity', function(d) {
      // calculate output opacity using the opacity scale
      var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
      if (Math.abs(d.value_up) > 0 && Math.abs(d.value_dn) > 0) {
        output_opacity = 0;
      }
      return output_opacity;
      })
      // switch the color based on up/dn value
      .style('fill', function(d) {
        // normal rule
        return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
      });

    tile
      .on('mouseover', function(p) {
      // highlight row - set text to active if
      d3.selectAll('.row_label_text text')
        .classed('active', function(d, i) {
        return i === p.source;
        });
      d3.selectAll('.col_label_text text')
        .classed('active', function(d, i) {
        return i === p.target;
        });
      })
      .on('mouseout', function mouseout() {
        d3.selectAll('text').classed('active', false);
      })
      .attr('title', function(d) {
      return d.value;
      });

      if ('highlight' in tile_data[0]){

        var rel_width_hlight = 4 ;
        var highlight_opacity = 0.0;

        var hlight_width  = rel_width_hlight*params.viz.border_width;
        var hlight_height = rel_width_hlight*params.viz.border_width/params.viz.zoom_switch;

        // top highlight
        tile
          .append('rect')
          .attr('class','highlight')
          .attr('id','perm_top_hlight')
          .attr('width', params.matrix.x_scale.rangeBand())
          .attr('height', hlight_height)
          .attr('fill',function(d){
            return d.highlight > 0 ? params.matrix.outline_colors[0] : params.matrix.outline_colors[1];
          })
          .attr('opacity',function(d){
            return Math.abs(d.highlight);
          });

        // left highlight
        tile
          .append('rect')
          .attr('class','highlight')
          .attr('id','perm_left_hlight')
          .attr('width', hlight_width)
          .attr('height', params.matrix.y_scale.rangeBand() - hlight_height*0.99 )
          .attr('fill',function(d){
            return d.highlight > 0 ? params.matrix.outline_colors[0] : params.matrix.outline_colors[1];
          })
          .attr('transform', function() {
            return 'translate(' + 0 + ','+
              hlight_height*0.99+')';
          })
          .attr('opacity',function(d){
            return Math.abs(d.highlight);
          });

        // right highlight
        tile
          .append('rect')
          .attr('class','highlight')
          .attr('id','perm_right_hlight')
          .attr('width', hlight_width)
          .attr('height', params.matrix.y_scale.rangeBand() - hlight_height*0.99 )
          .attr('fill',function(d){
            return d.highlight > 0 ? params.matrix.outline_colors[0] : params.matrix.outline_colors[1];
          })
          .attr('transform', function() {
            var tmp_translate = params.matrix.x_scale.rangeBand() - hlight_width;
            return 'translate(' + tmp_translate + ','+
              hlight_height*0.99+')';
          })
          .attr('opacity',function(d){
            return Math.abs(d.highlight);
          });

        // bottom highlight
        tile
          .append('rect')
          .attr('class','highlight')
          .attr('id','perm_ottom_hlight')
          .attr('width', function(){
            return params.matrix.x_scale.rangeBand() - 1.98*hlight_width})
          .attr('height', hlight_height)
          .attr('fill',function(d){
            return d.highlight > 0 ? params.matrix.outline_colors[0] : params.matrix.outline_colors[1];
          })
          .attr('transform', function() {
            var tmp_translate_x = hlight_width*0.99;
            var tmp_translate_y = params.matrix.y_scale.rangeBand() - hlight_height;
            return 'translate(' + tmp_translate_x + ','+
              tmp_translate_y+')';
          })
          .attr('opacity',function(d){
            return Math.abs(d.highlight);
          });

      }


    // split-up
    tile
      .append('path')
      // .style('stroke', 'black')
      .attr('class','tile_split_up')
      .style('stroke-width', 0)
      .attr('d', function() {
        var start_x = 0;
        var final_x = params.matrix.x_scale.rangeBand();
        var start_y = 0;
        var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /
          60;
        var output_string = 'M' + start_x + ',' + start_y + ', L' +
          start_x + ', ' + final_y + ', L' + final_x + ',0 Z';
        return output_string;
      })
      .style('fill-opacity', function(d) {
        // calculate output opacity using the opacity scale
        var output_opacity = 0;
        if (Math.abs(d.value_dn) > 0) {
          output_opacity = params.matrix.opacity_scale(Math.abs(d.value_up));
        }
        return output_opacity;
      })
      // switch the color based on up/dn value
      .style('fill', function() {
        // rl_t (released) blue
        return params.matrix.tile_colors[0];
      });


    // split-dn
    tile
      .append('path')
      .attr('class','tile_split_dn')
      // .style('stroke', 'black')
      .style('stroke-width', 0)
      .attr('d', function() {
        var start_x = 0;
        var final_x = params.matrix.x_scale.rangeBand();
        var start_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /
          60;
        var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /
          60;
        var output_string = 'M' + start_x + ', ' + start_y + ' ,   L' +
          final_x + ', ' + final_y + ',  L' + final_x + ',0 Z';
        return output_string;
      })
      .style('fill-opacity', function(d) {
        // calculate output opacity using the opacity scale
        var output_opacity = 0;
        if (Math.abs(d.value_up) > 0) {
          output_opacity = params.matrix.opacity_scale(Math.abs(d.value_dn));
        }
        return output_opacity;
      })
      // switch the color based on up/dn value
      .style('fill', function() {
        return params.matrix.tile_colors[1];
      });

    // append title to group
    if (params.matrix.tile_title) {
      tile
      .append('title')
      .text(function(d) {
        var inst_string = 'value: ' + d.value;
        return inst_string;
      });
    }

  }

  // Matrix API
  return {
    get_clust_group: function() {
      return clust_group;
    },
    get_matrix: function(){
      return matrix;
    },
    get_nodes: function(type){
      if (type === 'row'){
      var nodes = network_data.row_nodes;
      } else {
      var nodes = network_data.col_nodes;
      }
      return nodes;
    }
  }

}
