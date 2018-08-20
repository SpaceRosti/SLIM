const exec = require('child_process').spawn;
const fs = require('fs');

const tools = require('./toolbox');


exports.rewrite_fasta_with_OTU_ID = (os, config, callback) => {
	console.log(os.token + ": Rewrite the input fasta to add OTU values in headers");
	var directory = '/app/data/' + os.token + '/';
	var tmp_fasta = tools.tmp_filename() + ".fasta";
	var fasta_file = config.params.inputs.rewrite;
	
	var options = ['/app/lib/python_scripts/rewrite_fasta.py',
					'-fasta_in', directory + fasta_file,
					'-fasta_out', directory + tmp_fasta];

	// Logs
	console.log(os.token + ": Rewrite fasta");
	console.log("python3 " + options.join(' '));

	// Exec the rewriting
	var rewriter = exec ('python3', options);
	rewriter.stdout.on('data', function(data) {
		fs.appendFileSync(directory + config.log, data);
	});
	rewriter.stderr.on('data', function(data) {
		fs.appendFileSync(directory + config.log, data);
	});
	rewriter.on('close', function(code) {
		if (code != 0) {
			console.log(os.token + ': Impossible to rewrite fasta');
			callback(os, 'Impossible to rewrite fasta');
		} else {
			fs.unlinkSync(directory + fasta_file);
			fs.renameSync(directory + tmp_fasta, directory + fasta_file);
			callback(os, null);
		}
	});
}


// var uc_to_otu = (csv_uc_file, tsv_otu_file, sequence_origins, callback) => {
exports.write_from_uc = (os, config, callback) => {
	console.log(os.token + ": Read the UC file and write OTU table");

	var directory = '/app/data/' + os.token + '/';
	var uc_file = config.params.inputs.uc;
	var origins_file = config.params.inputs.origins;
	var otu_table = config.params.outputs.otus_table;
	var fin = config.params.inputs.merged;
	var fout = config.params.outputs.reads;

	var options = ['/app/lib/python_scripts/matrix_creation.py',
		'-uc', directory + uc_file,
		'-so', directory + origins_file,
		'-o', directory + otu_table,
		'-fasta_in', directory + fin,
		'-fasta_out', directory + fout];

	if (config.params.params.ordered == true)
		options = options.concat(['-t2s', directory + config.params.params.t2s]);

	console.log("python3", options.join(' '));

	var otu_soft = exec ('python3', options);

	otu_soft.stdout.on('data', function(data) {
		fs.appendFileSync(directory + config.log, data);
	});
	otu_soft.stderr.on('data', function(data) {
		fs.appendFileSync(directory + config.log, data);
	});
	otu_soft.on('close', function(code) {
		if (code != 0) {
			console.log(os.token + ': Impossible to write OTU table');
			callback(os, 'Impossible to write OTU table');
		} else {
			callback(os, null);
		}
	});
}
