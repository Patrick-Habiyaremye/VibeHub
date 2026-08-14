export const correctResult = (points = 1) => ({
  correct:true,
  points,
  feedback:null,
  meta:{},
});


export const wrongResult = (
  feedback = null
)=>({

  correct:false,

  points:0,

  feedback,

  meta:{},

});