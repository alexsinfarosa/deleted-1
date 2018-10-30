import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import withRoot from "../withRoot";

import Grid from "@material-ui/core/Grid";
import HomeIcon from "@material-ui/icons/HomeOutlined";
import ListIcon from "@material-ui/icons/ListOutlined";
import CloudIcon from "@material-ui/icons/CloudOutlined";

const styles = theme => ({
  root: {
    flexGrow: 1,
    background: "#fff",
    height: 100
  }
});

class Navigation extends Component {
  render() {
    const { classes, index, handleIndex } = this.props;
    return (
      <Grid item xs={12}>
        <Grid
          container
          className={classes.root}
          justify="center"
          alignItems="center"
        >
          <Grid item xs={4} style={{ textAlign: "center" }}>
            <CloudIcon
              style={{ fontSize: 35 }}
              onClick={() => handleIndex(index - 1)}
            />
          </Grid>
          <Grid item xs={4} style={{ textAlign: "center" }}>
            <HomeIcon style={{ fontSize: 35 }} />
          </Grid>
          <Grid item xs={4} style={{ textAlign: "center" }}>
            <ListIcon
              style={{ fontSize: 35 }}
              onClick={() => handleIndex(index + 1)}
            />
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default withRoot(withStyles(styles)(Navigation));